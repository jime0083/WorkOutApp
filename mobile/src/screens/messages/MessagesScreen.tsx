/**
 * MessagesScreen - LINE風トーク一覧画面
 * ダークテーマでLINEライクなデザイン
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
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '../../services/firebase';
import {
  subscribeToConversations,
  getMyInviteCode,
  findUserByInviteCode,
  sendFriendRequest,
  type Conversation,
} from '../../services/friendRequest';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useAuthStore } from '../../stores/authStore';
import type { MainStackParamList } from '../../navigation/types';
import '../../i18n';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface ConversationWithFriend extends Conversation {
  friendName: string;
  friendAvatar: string | null;
  requestFromNickname?: string;
  requestFromUserId?: string;
}

export const MessagesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user, userDocument } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [conversations, setConversations] = useState<ConversationWithFriend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [myInviteCode, setMyInviteCode] = useState<string>('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 会話一覧を取得
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToConversations(user.uid, async (convs) => {
      const db = getFirestoreInstance();
      const convsWithFriends: ConversationWithFriend[] = [];

      for (const conv of convs) {
        const friendId = conv.participantIds.find((id) => id !== user.uid);
        let friendName = t('chat.unknownUser');
        let friendAvatar: string | null = null;

        if (friendId) {
          const friendDoc = await getDoc(doc(db, 'users', friendId));
          if (friendDoc.exists()) {
            const friendData = friendDoc.data();
            friendName = friendData?.nickname || friendName;
            friendAvatar = friendData?.profileImageUrl || null;
          }
        }

        convsWithFriends.push({
          ...conv,
          friendName,
          friendAvatar,
          requestFromNickname: (conv as unknown as { requestFromNickname?: string }).requestFromNickname,
          requestFromUserId: (conv as unknown as { requestFromUserId?: string }).requestFromUserId,
        });
      }

      setConversations(convsWithFriends);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, t]);

  // 自分の招待コードを取得
  useEffect(() => {
    if (!user) return;
    getMyInviteCode(user.uid).then((code) => {
      if (code) setMyInviteCode(code);
    });
  }, [user]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleConversationPress = useCallback(
    (conversation: ConversationWithFriend) => {
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

  const handleAddFriend = useCallback(() => {
    setShowAddFriendModal(true);
  }, []);

  const handleSearchByInviteCode = useCallback(async () => {
    if (!inviteCodeInput.trim() || !user) return;

    setIsSearching(true);
    try {
      const foundUser = await findUserByInviteCode(inviteCodeInput.trim());

      if (!foundUser) {
        Alert.alert(t('friends.userNotFound'));
        return;
      }

      if (foundUser.userId === user.uid) {
        Alert.alert(t('friends.cannotAddSelf'));
        return;
      }

      // 友達リクエストを送信
      const result = await sendFriendRequest(
        user.uid,
        foundUser.userId,
        userDocument?.nickname || 'User',
        userDocument?.profileImageUrl || null
      );

      if (result.success) {
        Alert.alert(t('friends.requestSent'));
        setShowAddFriendModal(false);
        setInviteCodeInput('');
      } else if (result.error === 'already_exists') {
        Alert.alert(t('friends.alreadyFriend'));
      } else {
        Alert.alert(t('common.error'));
      }
    } catch (error) {
      console.error('Error searching by invite code:', error);
      Alert.alert(t('common.error'));
    } finally {
      setIsSearching(false);
    }
  }, [inviteCodeInput, user, userDocument, t]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return t('chat.yesterday') || '昨日';
    } else if (days < 7) {
      const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
      return weekdays[date.getDay()];
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.friendName.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderConversation = ({ item }: { item: ConversationWithFriend }) => {
    const isPending = item.status === 'pending' && item.requestFromUserId !== user?.uid;
    const unreadCount = item.unreadCount[user?.uid || ''] || 0;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {item.friendAvatar ? (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.friendName.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.friendName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.friendName} numberOfLines={1}>
              {item.friendName}
              {isPending && (
                <Text style={styles.pendingTag}> [{t('friendRequest.pending')}]</Text>
              )}
            </Text>
            <Text style={styles.time}>{formatTime(item.lastMessageAt)}</Text>
          </View>
          <View style={styles.messageRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {isPending
                ? t('friendRequest.newRequest')
                : item.lastMessage || t('chat.noMessages')}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.lineDark.background} />

      {/* ヘッダー */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerTabs}>
            <TouchableOpacity style={[styles.headerTab, styles.headerTabActive]}>
              <Text style={styles.headerTabTextActive}>{t('nav.talk')}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTabDivider}>|</Text>
            <TouchableOpacity style={styles.headerTab}>
              <Text style={styles.headerTabText}>{t('nav.friends')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.headerIcon}>
              <Text style={styles.headerIconText}>⚙️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Text style={styles.headerIconText}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} onPress={handleAddFriend}>
              <Text style={styles.addIcon}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 検索バー */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.search')}
            placeholderTextColor={colors.lineDark.textTertiary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* トーク一覧 */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.lineDark.green} />
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>{t('conversation.empty')}</Text>
          <Text style={styles.emptyHint}>{t('conversation.emptyHint')}</Text>
          <TouchableOpacity style={styles.addFriendButton} onPress={handleAddFriend}>
            <Text style={styles.addFriendButtonText}>{t('conversation.addFriend')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 友達追加モーダル */}
      <Modal
        visible={showAddFriendModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddFriendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + spacing.xl }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('friends.addFriend')}</Text>
              <TouchableOpacity
                onPress={() => setShowAddFriendModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 自分の招待コード */}
            <View style={styles.myCodeSection}>
              <Text style={styles.sectionLabel}>{t('friends.yourInviteCode')}</Text>
              <View style={styles.codeDisplay}>
                <Text style={styles.codeText}>{myInviteCode}</Text>
              </View>
              <Text style={styles.codeHint}>{t('friends.shareCodeHint')}</Text>
            </View>

            {/* 招待コード入力 */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionLabel}>{t('friends.enterInviteCode')}</Text>
              <TextInput
                style={styles.codeInput}
                placeholder={t('friends.inviteCodePlaceholder')}
                placeholderTextColor={colors.lineDark.textTertiary}
                value={inviteCodeInput}
                onChangeText={setInviteCodeInput}
                autoCapitalize="characters"
                maxLength={8}
              />
              <TouchableOpacity
                style={[
                  styles.searchButton,
                  (!inviteCodeInput.trim() || isSearching) && styles.searchButtonDisabled,
                ]}
                onPress={handleSearchByInviteCode}
                disabled={!inviteCodeInput.trim() || isSearching}
              >
                <Text style={styles.searchButtonText}>
                  {isSearching ? t('common.searching') : t('friends.sendRequest')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lineDark.background,
  },
  header: {
    backgroundColor: colors.lineDark.header,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  backArrow: {
    fontSize: 32,
    color: colors.lineDark.textPrimary,
    fontWeight: typography.weights.light as '300',
  },
  headerTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerTab: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerTabActive: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.lineDark.green,
  },
  headerTabText: {
    fontSize: typography.sizes.md,
    color: colors.lineDark.textSecondary,
    fontWeight: typography.weights.medium as '500',
  },
  headerTabTextActive: {
    fontSize: typography.sizes.md,
    color: colors.lineDark.textPrimary,
    fontWeight: typography.weights.bold as '700',
  },
  headerTabDivider: {
    color: colors.lineDark.textTertiary,
    marginHorizontal: spacing.xs,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: spacing.sm,
  },
  headerIconText: {
    fontSize: 20,
  },
  addIcon: {
    fontSize: 28,
    color: colors.lineDark.textPrimary,
    fontWeight: typography.weights.light as '300',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lineDark.searchBg,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.lineDark.textPrimary,
    padding: 0,
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
  emptyIcon: {
    fontSize: 60,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    color: colors.lineDark.textPrimary,
    fontWeight: typography.weights.semibold as '600',
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: typography.sizes.md,
    color: colors.lineDark.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  addFriendButton: {
    backgroundColor: colors.lineDark.green,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  addFriendButtonText: {
    fontSize: typography.sizes.md,
    color: colors.lineDark.textPrimary,
    fontWeight: typography.weights.semibold as '600',
  },
  listContent: {
    paddingTop: spacing.xs,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.lineDark.background,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.lineDark.border,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.lineDark.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as '700',
    color: colors.lineDark.textPrimary,
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
    fontWeight: typography.weights.medium as '500',
    color: colors.lineDark.textPrimary,
    flex: 1,
  },
  pendingTag: {
    fontSize: typography.sizes.sm,
    color: colors.lineDark.green,
  },
  time: {
    fontSize: typography.sizes.xs,
    color: colors.lineDark.textSecondary,
    marginLeft: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: typography.sizes.sm,
    color: colors.lineDark.textSecondary,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: colors.lineDark.unreadBadge,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginLeft: spacing.sm,
  },
  unreadText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold as '700',
    color: colors.lineDark.textPrimary,
  },
  // モーダルスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.lineDark.surface,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  modalTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.lineDark.textPrimary,
  },
  modalCloseButton: {
    padding: spacing.sm,
  },
  modalCloseText: {
    fontSize: 20,
    color: colors.lineDark.textSecondary,
  },
  myCodeSection: {
    marginBottom: spacing['2xl'],
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    color: colors.lineDark.textSecondary,
    marginBottom: spacing.sm,
  },
  codeDisplay: {
    backgroundColor: colors.lineDark.searchBg,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  codeText: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.lineDark.green,
    letterSpacing: 4,
  },
  codeHint: {
    fontSize: typography.sizes.xs,
    color: colors.lineDark.textTertiary,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  codeInput: {
    backgroundColor: colors.lineDark.searchBg,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    fontSize: typography.sizes.lg,
    color: colors.lineDark.textPrimary,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  searchButton: {
    backgroundColor: colors.lineDark.green,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as '600',
    color: colors.lineDark.textPrimary,
  },
});

export default MessagesScreen;
