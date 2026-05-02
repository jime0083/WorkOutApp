/**
 * Firebase認証サービス（React Native用）
 */
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type { User, CreateUserInput } from '../types/user';

// 認証結果型
export interface AuthResult {
  success: boolean;
  user?: FirebaseAuthTypes.User;
  error?: string;
  isDummyLogin?: boolean;
}

// ログイン結果型
export interface LoginResult extends AuthResult {
  isDummyLogin: boolean;
}

/**
 * メールアドレスでログイン
 * ダミーメールと本命メールの両方を試行し、どちらでログインしたかを返す
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    // まず入力されたメールアドレスでログインを試行
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password
    );

    // ユーザードキュメントを取得してダミーかどうか判定
    const userDoc = await firestore()
      .collection('users')
      .doc(userCredential.user.uid)
      .get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: 'User document not found',
        isDummyLogin: false,
      };
    }

    const userData = userDoc.data() as User;
    const isDummyLogin = userData.dummyEmail === email;

    return {
      success: true,
      user: userCredential.user,
      isDummyLogin,
    };
  } catch (error) {
    const firebaseError = error as FirebaseAuthTypes.NativeFirebaseAuthError;
    return {
      success: false,
      error: firebaseError.message || 'Login failed',
      isDummyLogin: false,
    };
  }
}

/**
 * 新規ユーザー登録
 * ダミーアカウントと本命アカウントを両方作成
 */
export async function registerUser(input: CreateUserInput): Promise<AuthResult> {
  try {
    // 本命アカウントを作成
    const userCredential = await auth().createUserWithEmailAndPassword(
      input.realEmail,
      input.realPassword
    );

    // ダミーアカウントも作成（別のFirebase Authユーザーとして）
    // 注意: これはCloud Functionsで処理するべき
    // クライアントからは本命アカウントのみ作成し、
    // Cloud Functionsでダミーアカウントを紐付ける

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    const firebaseError = error as FirebaseAuthTypes.NativeFirebaseAuthError;
    return {
      success: false,
      error: firebaseError.message || 'Registration failed',
    };
  }
}

/**
 * ログアウト
 */
export async function logout(): Promise<void> {
  await auth().signOut();
}

/**
 * 現在の認証ユーザーを取得
 */
export function getCurrentUser(): FirebaseAuthTypes.User | null {
  return auth().currentUser;
}

/**
 * 認証状態の変更を監視
 */
export function onAuthStateChanged(
  callback: (user: FirebaseAuthTypes.User | null) => void
): () => void {
  return auth().onAuthStateChanged(callback);
}

/**
 * パスワードリセットメールを送信
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  await auth().sendPasswordResetEmail(email);
}

/**
 * メールアドレスの確認メールを送信
 */
export async function sendEmailVerification(): Promise<void> {
  const user = auth().currentUser;
  if (user) {
    await user.sendEmailVerification();
  }
}

/**
 * ユーザードキュメントを取得
 */
export async function getUserDocument(userId: string): Promise<User | null> {
  const doc = await firestore().collection('users').doc(userId).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as User;
}

/**
 * Firebase ID トークンを取得
 * Webアプリへの認証情報引き渡しに使用
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth().currentUser;
  if (!user) {
    return null;
  }
  return user.getIdToken();
}

/**
 * 本命ログイン後の処理
 * Webアプリを外部ブラウザで開く
 */
export async function handleRealLogin(userId: string): Promise<string | null> {
  const idToken = await getIdToken();
  return idToken;
}

export { auth };
