/**
 * DummyMessagesScreen - ダミーのメッセージ画面
 * 固定のダミーデータを表示
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';
import '../../i18n';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface DummyConversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
}

// ダミーの会話データ
const dummyConversations: DummyConversation[] = [
  {
    id: '1',
    name: 'ジム仲間',
    lastMessage: '今週の筋トレスケジュールどうする？',
    time: '2時間前',
    unreadCount: 0,
  },
  {
    id: '2',
    name: 'ランニングクラブ',
    lastMessage: '明日の朝ラン参加します！',
    time: '昨日',
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'ヨガ教室',
    lastMessage: '来週のクラスの予約確認です',
    time: '2日前',
    unreadCount: 0,
  },
  {
    id: '4',
    name: 'パーソナルトレーナー',
    lastMessage: '食事メニューを送りますね',
    time: '3日前',
    unreadCount: 0,
  },
];

export const DummyMessagesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderConversation = ({ item }: { item: DummyConversation }) => (
    <TouchableOpacity style={styles.conversationItem} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.friendName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
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

      <FlatList
        data={dummyConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
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
    backgroundColor: colors.gray[400],
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

export default DummyMessagesScreen;
