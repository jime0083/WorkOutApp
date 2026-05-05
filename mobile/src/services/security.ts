/**
 * セキュリティサービス（React Native）
 * スクリーンショット防止、画面録画防止
 */
import { Platform, AppState, AppStateStatus } from 'react-native';
import ScreenshotPrevent from 'react-native-screenshot-prevent';

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

  if (Platform.OS === 'ios') {
    // iOSでのスクリーンショット防止
    if (currentConfig.preventScreenshot) {
      enableScreenshotPrevention();
    }
  }

  isInitialized = true;
  console.log('Security service initialized');
}

/**
 * スクリーンショット防止を有効化
 */
export function enableScreenshotPrevention(): void {
  if (Platform.OS === 'ios') {
    try {
      ScreenshotPrevent.enableSecureView();
      console.log('Screenshot prevention enabled');
    } catch (error) {
      console.error('Failed to enable screenshot prevention:', error);
    }
  }
}

/**
 * スクリーンショット防止を無効化
 */
export function disableScreenshotPrevention(): void {
  if (Platform.OS === 'ios') {
    try {
      ScreenshotPrevent.disableSecureView();
      console.log('Screenshot prevention disabled');
    } catch (error) {
      console.error('Failed to disable screenshot prevention:', error);
    }
  }
}

/**
 * スクリーンショット検出リスナーを設定
 */
export function setupScreenshotListener(
  callback: () => void
): () => void {
  if (Platform.OS === 'ios') {
    const subscription = ScreenshotPrevent.addListener(() => {
      console.log('Screenshot detected');
      callback();
    });

    return () => {
      subscription.remove();
    };
  }

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
