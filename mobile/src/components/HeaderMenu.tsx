/**
 * HeaderMenu - ヘッダーメニューコンポーネント
 * ダミーホーム画面のヘッダーに表示されるメニューボタン
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../theme';
import type { MainStackParamList } from '../navigation/types';
import { subscribeToUnreadCountWithBadge } from '../services/unreadCount';
import { useAuthStore } from '../stores/authStore';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const HeaderMenu: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userDocument = useAuthStore((state) => state.userDocument);

  // 未読件数をリアルタイムで監視（アプリアイコンバッジも自動更新）
  useEffect(() => {
    if (!userDocument?.id) return;

    const unsubscribe = subscribeToUnreadCountWithBadge(userDocument.id, (count) => {
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [userDocument?.id]);

  const openMenu = useCallback(() => {
    setIsMenuVisible(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuVisible(false);
  }, []);

  const handleSettingsPress = useCallback(() => {
    closeMenu();
    navigation.navigate('PasswordPrompt', { purpose: 'settings' });
  }, [closeMenu, navigation]);

  const handleUpdatePress = useCallback(() => {
    // アップデートは押しても何も起きない（件数表示のみ）
    // メニューは閉じない
  }, []);

  const handlePlanChangePress = useCallback(() => {
    closeMenu();
    navigation.navigate('Subscription');
  }, [closeMenu, navigation]);

  return (
    <>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={openMenu}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.menuIcon}></Text>
      </TouchableOpacity>

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <View style={styles.menuContainer}>
            {/* アップデート（未読件数表示のみ、遷移なし） */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleUpdatePress}
              activeOpacity={1}
            >
              <Text style={styles.menuItemIcon}>🔔</Text>
              <Text style={styles.menuItemText}>{t('menu.update')}</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* プラン変更 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handlePlanChangePress}
            >
              <Text style={styles.menuItemIcon}>💎</Text>
              <Text style={styles.menuItemText}>{t('menu.changePlan')}</Text>
            </TouchableOpacity>

            {/* 設定 */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSettingsPress}
            >
              <Text style={styles.menuItemIcon}>⚙️</Text>
              <Text style={styles.menuItemText}>{t('common.settings')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    padding: spacing.sm,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginTop: 80,
    marginRight: spacing.md,
    minWidth: 200,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  menuItemText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.medium as '500',
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
