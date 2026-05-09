/**
 * MessagesScreen - 本物のメッセージ一覧画面
 * Firestoreからメッセージを取得・表示
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import firestore from '@react-native-firebase/firestore';
import { colors, typography, spacing } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import type { MainStackParamList } from '../../navigation/types';
import '../../i18n';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  friendName?: string;
  friendAvatar?: string;
}

export const MessagesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = firestore()
      .collection('conversations')
      .where('participantIds', 'array-contains', user.uid)
      .orderBy('lastMessageAt', 'desc')
      .onSnapshot(
        async (snapshot) => {
          const convs: Conversation[] = [];
          for (const doc of snapshot.docs) {
            const data = doc.data();
            const friendId = data.participantIds.find(
              (id: string) => id !== user.uid
            );

            // 友達の情報を取得
            let friendName = t('chat.unknownUser');
            let friendAvatar: string | undefined;
            if (friendId != null) {
              const friendDoc = await firestore()
                .collection('users')
                .doc(friendId)
                .get();
              if (friendDoc.exists) {
                const friendData = friendDoc.data();
                friendName = friendData?.nickname || friendData?.displayName || friendName;
                friendAvatar = friendData?.avatarUrl;
              }
            }

            convs.push({
              id: doc.id,
              participantIds: data.participantIds,
              lastMessage: data.lastMessage || '',
              lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
              unreadCount: data.unreadCount?.[user.uid] || 0,
              friendName,
              friendAvatar,
            });
          }
          setConversations(convs);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error fetching conversations:', error);
          setIsLoading(false);
        }
      );

    return () => unsubscribe();
  }, [user, t]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleConversationPress = useCallback(
    (conversation: Conversation) => {
      const friendId = conversation.participantIds.find(
        (id) => id !== user?.uid
      );
      if (friendId) {
        navigation.navigate('Conversation', {
          conversationId: conversation.id,
          friendId,
        });
      }
    },
    [navigation, user]
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) {
      return t('dummy.minutes', { count: Math.floor(diff / (1000 * 60)) });
    } else if (hours < 24) {
      return `${hours}${t('dummy.hours')}`;
    } else {
      return `${days}${t('dummy.hours')}`;
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.friendName?.charAt(0).toUpperCase() || '?'}
        </Text>
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.friendName} numberOfLines={1}>
            {item.friendName}
          </Text>
          <Text style={styles.time}>{formatTime(item.lastMessageAt)}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'} {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('nav.talk')}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('conversation.empty')}</Text>
          <Text style={styles.emptyHint}>{t('conversation.emptyHint')}</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as '700',
    color: colors.white,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  friendName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
    flex: 1,
  },
  time: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: spacing.sm,
  },
  unreadText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold as '700',
    color: colors.white,
  },
});

export default MessagesScreen;
