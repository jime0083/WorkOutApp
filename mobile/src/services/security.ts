/**
 * セキュリティサービス（React Native）
 * スクリーンショット防止、画面録画防止
 *
 * NOTE: react-native-screenshot-preventはReact Native 0.85と互換性がないため
 * 現在は無効化されています。将来的に互換性のあるパッケージが利用可能になったら
 * 再度有効化してください。
 */
import { Platform, AppState, AppStateStatus } from 'react-native';

// セキュリティ設定
interface SecurityConfig {
  preventScreenshot: boolean;
  preventScreenRecording: boolean;
  blurOnBackground: boolean;
}

const defaultConfig: SecurityConfig = {
  preventScreenshot: true,
  preventScreenRecording: true,
  blurOnBackground: true,
};

let currentConfig: SecurityConfig = { ...defaultConfig };
let isInitialized = false;

/**
 * セキュリティ機能を初期化
 */
export function initializeSecurity(config?: Partial<SecurityConfig>): void {
  if (isInitialized) {
    return;
  }

  currentConfig = { ...defaultConfig, ...config };

  // TODO: react-native-screenshot-preventが React Native 0.85に対応したら有効化
  // if (Platform.OS === 'ios') {
  //   if (currentConfig.preventScreenshot) {
  //     enableScreenshotPrevention();
  //   }
  // }

  isInitialized = true;
  console.log('Security service initialized (screenshot prevention disabled due to RN 0.85 compatibility)');
}

/**
 * スクリーンショット防止を有効化
 * NOTE: 現在は無効化されています
 */
export function enableScreenshotPrevention(): void {
  if (Platform.OS === 'ios') {
    // TODO: react-native-screenshot-preventが利用可能になったら有効化
    console.log('Screenshot prevention is currently disabled (RN 0.85 compatibility)');
  }
}

/**
 * スクリーンショット防止を無効化
 */
export function disableScreenshotPrevention(): void {
  if (Platform.OS === 'ios') {
    // TODO: react-native-screenshot-preventが利用可能になったら有効化
    console.log('Screenshot prevention disable called (currently disabled)');
  }
}

/**
 * スクリーンショット検出リスナーを設定
 */
export function setupScreenshotListener(
  _callback: () => void
): () => void {
  // TODO: react-native-screenshot-preventが利用可能になったら有効化
  console.log('Screenshot listener is currently disabled (RN 0.85 compatibility)');
  return () => {};
}

/**
 * アプリがバックグラウンドに移行した時の処理
 * プライバシー保護のため画面をブラーする
 */
let appStateSubscription: { remove: () => void } | null = null;

export function setupBackgroundBlur(): () => void {
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // バックグラウンドに移行時はセキュアビューを有効化
      if (currentConfig.blurOnBackground) {
        enableScreenshotPrevention();
      }
    } else if (nextAppState === 'active') {
      // フォアグラウンドに復帰時
      // セキュアビューは引き続き有効
    }
  };

  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

  return () => {
    if (appStateSubscription) {
      appStateSubscription.remove();
      appStateSubscription = null;
    }
  };
}

/**
 * セキュリティ機能をクリーンアップ
 */
export function cleanupSecurity(): void {
  disableScreenshotPrevention();

  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }

  isInitialized = false;
  console.log('Security service cleaned up');
}

/**
 * 画面録画防止（iOS 11以降）
 * 注意: react-native-screenshot-preventは画面録画も防止する
 */
export function isScreenRecordingActive(): boolean {
  // この機能はreact-native-screenshot-preventのenableSecureViewで
  // 自動的に画面録画も防止される
  return false;
}

/**
 * セキュリティ状態を取得
 */
export function getSecurityStatus(): {
  isInitialized: boolean;
  config: SecurityConfig;
} {
  return {
    isInitialized,
    config: { ...currentConfig },
  };
}
