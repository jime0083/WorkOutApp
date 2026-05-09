/**
 * ConversationScreen - 会話詳細画面
 * メッセージの送受信
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { colors, typography, spacing } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import type { MainStackParamList } from '../../navigation/types';
import '../../i18n';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type ConversationRouteProp = RouteProp<MainStackParamList, 'Conversation'>;

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
  isDeleted: boolean;
}

const MAX_FREE_MESSAGES = 10;

export const ConversationScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ConversationRouteProp>();
  const { conversationId, friendId } = route.params;
  const { user, userDocument } = useAuthStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [friendName, setFriendName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isPremium = userDocument?.isPremium ?? false;

  useEffect(() => {
    // 友達の名前を取得
    const fetchFriendName = async () => {
      const friendDoc = await firestore()
        .collection('users')
        .doc(friendId)
        .get();
      if (friendDoc.exists === true) {
        const data = friendDoc.data();
        setFriendName(data?.nickname || data?.displayName || t('chat.unknownUser'));
      }
    };
    fetchFriendName();
  }, [friendId, t]);

  useEffect(() => {
    // 今月のメッセージ数を取得
    if (!user) return;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const unsubscribe = firestore()
      .collection('messages')
      .where('senderId', '==', user.uid)
      .where('createdAt', '>=', startOfMonth)
      .onSnapshot((snapshot) => {
        setMessageCount(snapshot.size);
      });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    // メッセージを取得
    const unsubscribe = firestore()
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot((snapshot) => {
        const msgs: Message[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            senderId: data.senderId,
            text: data.text,
            createdAt: data.createdAt?.toDate() || new Date(),
            isDeleted: data.isDeleted || false,
          };
        });
        setMessages(msgs.reverse());
      });

    return () => unsubscribe();
  }, [conversationId]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !user) return;

    // 無料プランのメッセージ制限チェック
    if (!isPremium && messageCount >= MAX_FREE_MESSAGES) {
      Alert.alert(
        t('premium.required'),
        t('chat.messageLimit'),
        [
          { text: t('common.close'), style: 'cancel' },
          {
            text: t('premium.upgrade'),
            onPress: () => navigation.navigate('Subscription'),
          },
        ]
      );
      return;
    }

    setIsLoading(true);
    const messageText = inputText.trim();
    setInputText('');

    try {
      // メッセージを追加
      await firestore()
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .add({
          senderId: user.uid,
          text: messageText,
          createdAt: firestore.FieldValue.serverTimestamp(),
          isDeleted: false,
        });

      // 会話の最終メッセージを更新
      await firestore()
        .collection('conversations')
        .doc(conversationId)
        .update({
          lastMessage: messageText,
          lastMessageAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  }, [inputText, user, isPremium, messageCount, conversationId, navigation, t]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.uid;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myBubble : styles.theirBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMe ? styles.myMessageText : styles.theirMessageText,
              item.isDeleted && styles.deletedText,
            ]}
          >
            {item.isDeleted ? t('chat.messageDeleted') : item.text}
          </Text>
        </View>
        <Text style={styles.messageTime}>
          {item.createdAt.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  const remainingMessages = Math.max(0, MAX_FREE_MESSAGES - messageCount);

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{friendName}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* メッセージ残数（無料プランのみ） */}
      {!isPremium && (
        <View style={styles.remainingBanner}>
          <Text style={styles.remainingText}>
            {t('chat.remainingMessages', { count: remainingMessages })}
          </Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
        />

        {/* 入力エリア */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={
              !isPremium && messageCount >= MAX_FREE_MESSAGES
                ? t('placeholder.messageLimitReached')
                : t('placeholder.message')
            }
            placeholderTextColor={colors.text.secondary}
            multiline
            maxLength={1000}
            editable={isPremium || messageCount < MAX_FREE_MESSAGES}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>{t('common.send')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  backButtonText: {
    fontSize: typography.sizes.xl,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  remainingBanner: {
    backgroundColor: colors.primaryLight,
    padding: spacing.sm,
    alignItems: 'center',
  },
  remainingText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: spacing.xs,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: colors.gray[200],
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: typography.sizes.md,
  },
  myMessageText: {
    color: colors.white,
  },
  theirMessageText: {
    color: colors.text.primary,
  },
  deletedText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  messageTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  sendButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as '600',
  },
});

export default ConversationScreen;
