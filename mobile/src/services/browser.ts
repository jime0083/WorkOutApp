/**
 * 外部ブラウザ遷移サービス
 * 本命パスワードでログイン時にWebアプリをSafariで開く
 */
import { Linking, Alert, Platform } from 'react-native';

// Web アプリの URL（本番環境に合わせて設定）
const WEB_APP_BASE_URL = __DEV__
  ? 'http://localhost:5173'
  : 'https://your-username.github.io/workoutapp-web';

/**
 * Webアプリを外部ブラウザで開く
 * 認証トークンを含むURLで開くことで自動ログインを実現
 */
export async function openWebApp(authToken?: string): Promise<boolean> {
  try {
    let url = WEB_APP_BASE_URL;

    // 認証トークンがある場合はURLパラメータに追加
    if (authToken) {
      url = `${WEB_APP_BASE_URL}?token=${encodeURIComponent(authToken)}`;
    }

    // URLが開けるか確認
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert(
        'エラー',
        'ブラウザを開けませんでした。\nURLを直接ブラウザに入力してください。'
      );
      return false;
    }

    // 外部ブラウザで開く
    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error('Failed to open web app:', error);
    Alert.alert('エラー', 'ブラウザの起動に失敗しました');
    return false;
  }
}

/**
 * Safariで特定のURLを開く（iOS専用）
 */
export async function openInSafari(url: string): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return openInBrowser(url);
  }

  try {
    // iOS では safari:// スキームは使えないので通常のURLで開く
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('エラー', 'このURLを開けません');
      return false;
    }

    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error('Failed to open Safari:', error);
    return false;
  }
}

/**
 * 外部ブラウザでURLを開く
 */
export async function openInBrowser(url: string): Promise<boolean> {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('エラー', 'このURLを開けません');
      return false;
    }

    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.error('Failed to open browser:', error);
    Alert.alert('エラー', 'ブラウザの起動に失敗しました');
    return false;
  }
}

/**
 * 本命ログイン後のWebアプリ遷移処理
 * 認証完了後にこの関数を呼び出す
 */
export async function redirectToWebApp(
  userId: string,
  idToken: string
): Promise<void> {
  // Firebase IDトークンをパラメータにしてWebアプリを開く
  // Webアプリ側でこのトークンを使って認証を維持する
  const url = `${WEB_APP_BASE_URL}/auth/callback?userId=${encodeURIComponent(
    userId
  )}&token=${encodeURIComponent(idToken)}`;

  const opened = await openInSafari(url);

  if (opened) {
    // ブラウザを開いた後、アプリはダミー画面を表示したままにする
    // または必要に応じてダミーのホーム画面に戻る
    console.log('Web app opened successfully');
  }
}

/**
 * アプリ更新ページを開く（偽装通知からの遷移用）
 */
export async function openUpdatePage(): Promise<boolean> {
  // App Store の更新ページ（偽装）
  // 実際には存在しないか、アプリの説明ページに遷移
  const appStoreUrl = Platform.select({
    ios: 'https://apps.apple.com/app/id000000000', // 実際のApp IDに置き換え
    default: WEB_APP_BASE_URL,
  });

  return openInBrowser(appStoreUrl);
}
