/**
 * HeaderMenu - ヘッダーメニューコンポーネント
 * ダミーホーム画面のヘッダーに表示されるメニューボタン
 */
import React, { useState, useCallback } from 'react';
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

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const HeaderMenu: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

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

  return (
    <>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={openMenu}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <View style={styles.menuContainer}>
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
    minWidth: 180,
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
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  menuItemText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    fontWeight: typography.weights.medium as '500',
  },
});
