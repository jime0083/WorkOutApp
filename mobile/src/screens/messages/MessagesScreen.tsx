/**
 * MessagesScreen - 本物のメッセージ一覧画面
 * Firestoreからメッセージを取得・表示
 * Design: Wellness Serenity
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { getFirestoreInstance } from '../../services/firebase';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
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
  const insets = useSafeAreaInsets();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const db = getFirestoreInstance();
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const convs: Conversation[] = [];
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          const friendId = data.participantIds.find(
            (id: string) => id !== user.uid
          );

          // 友達の情報を取得
          let friendName = t('chat.unknownUser');
          let friendAvatar: string | undefined;
          if (friendId != null) {
            const friendDoc = await getDoc(doc(db, 'users', friendId));
            if (friendDoc.exists()) {
              const friendData = friendDoc.data();
              friendName = friendData?.nickname || friendData?.displayName || friendName;
              friendAvatar = friendData?.avatarUrl;
            }
          }

          convs.push({
            id: docSnap.id,
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
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* ヘッダー */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <View style={styles.backButtonContainer}>
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.title}>{t('nav.talk')}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
          </View>
          <Text style={styles.emptyText}>{t('conversation.empty')}</Text>
          <Text style={styles.emptyHint}>{t('conversation.emptyHint')}</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    ...shadows.sm,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: colors.primary,
    marginRight: spacing.xs,
    fontWeight: typography.weights.medium as '500',
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.medium as '500',
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
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
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  emptyIcon: {
    fontSize: 40,
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
    lineHeight: 24,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
  },
  avatarText: {
    fontSize: typography.sizes.xl,
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
    marginBottom: spacing.xs,
  },
  friendName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
    flex: 1,
  },
  time: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
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
    borderRadius: borderRadius.full,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginLeft: spacing.sm,
  },
  unreadText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold as '700',
    color: colors.white,
  },
});

export default MessagesScreen;
