/**
 * ConversationScreen - 会話詳細画面
 * メッセージの送受信
 * Design: Wellness Serenity
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getFirestoreInstance } from '../../services/firebase';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import type { MainStackParamList } from '../../navigation/types';
import { isPremiumUser } from '../../types/user';
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
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [friendName, setFriendName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isPremium = isPremiumUser(userDocument);

  useEffect(() => {
    // 友達の名前を取得
    const fetchFriendName = async () => {
      const db = getFirestoreInstance();
      const friendDoc = await getDoc(doc(db, 'users', friendId));
      if (friendDoc.exists()) {
        const data = friendDoc.data();
        setFriendName(data?.nickname || data?.displayName || t('chat.unknownUser'));
      }
    };
    fetchFriendName();
  }, [friendId, t]);

  useEffect(() => {
    // 今月のメッセージ数を取得
    if (!user) return;

    const db = getFirestoreInstance();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const q = query(
      collection(db, 'messages'),
      where('senderId', '==', user.uid),
      where('createdAt', '>=', Timestamp.fromDate(startOfMonth))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessageCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    // メッセージを取得
    const db = getFirestoreInstance();
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
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
      const db = getFirestoreInstance();

      // メッセージを追加
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        senderId: user.uid,
        text: messageText,
        createdAt: serverTimestamp(),
        isDeleted: false,
      });

      // 会話の最終メッセージを更新
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: messageText,
        lastMessageAt: serverTimestamp(),
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

      {/* ヘッダー */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {friendName.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.headerTitle}>{friendName}</Text>
        </View>
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
          showsVerticalScrollIndicator={false}
        />

        {/* 入力エリア */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing.sm }]}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={
              !isPremium && messageCount >= MAX_FREE_MESSAGES
                ? t('placeholder.messageLimitReached')
                : t('placeholder.message')
            }
            placeholderTextColor={colors.text.tertiary}
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
            activeOpacity={0.8}
          >
            <Text style={styles.sendButtonText}>{t('common.send')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    ...shadows.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: typography.weights.medium as '500',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerAvatarText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold as '700',
    color: colors.white,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
  },
  headerRight: {
    width: 44,
  },
  remainingBanner: {
    backgroundColor: colors.primaryMuted,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  remainingText: {
    fontSize: typography.sizes.sm,
    color: colors.primaryDark,
    fontWeight: typography.weights.medium as '500',
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.lg,
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
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.xs,
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  theirBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: spacing.xs,
  },
  messageText: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
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
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
    ...shadows.sm,
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
