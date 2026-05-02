/**
 * 共通ローディングコンポーネント
 */

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal,
  ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

type LoadingSize = 'small' | 'large';

interface LoadingProps {
  size?: LoadingSize;
  color?: string;
  text?: string;
  style?: ViewStyle;
}

interface FullScreenLoadingProps {
  visible: boolean;
  text?: string;
}

// インラインローディング
export const Loading: React.FC<LoadingProps> = ({
  size = 'small',
  color = colors.primary,
  text,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

// フルスクリーンローディング
export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  visible,
  text,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          {text && <Text style={styles.overlayText}>{text}</Text>}
        </View>
      </View>
    </Modal>
  );
};

// センター配置ローディング
export const CenteredLoading: React.FC<LoadingProps> = ({
  size = 'large',
  color = colors.primary,
  text,
}) => {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.centeredText}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },

  // Full screen loading
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingBox: {
    backgroundColor: colors.white,
    padding: spacing['2xl'],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minWidth: 120,
  },

  overlayText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },

  // Centered loading
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  centeredText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
});

export default Loading;
