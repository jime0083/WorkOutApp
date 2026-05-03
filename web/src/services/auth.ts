/**
 * Firebase認証サービス（Web用）
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
} from 'firebase/auth';
import type { User as FirebaseUser, UserCredential } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, CreateUserInput } from '../types/user';

// 認証結果型
export interface AuthResult {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
}

// ログイン結果型
export interface LoginResult extends AuthResult {
  isDummyLogin: boolean;
}

/**
 * メールアドレスでログイン
 * ダミーメールと本命メールの両方に対応
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // ユーザードキュメントを取得してダミーかどうか判定
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
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
    const firebaseError = error as { message?: string; code?: string };
    let errorMessage = 'Login failed';

    switch (firebaseError.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = 'メールアドレスまたはパスワードが正しくありません';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'ログイン試行回数が多すぎます。しばらくお待ちください';
        break;
      default:
        errorMessage = firebaseError.message || 'Login failed';
    }

    return {
      success: false,
      error: errorMessage,
      isDummyLogin: false,
    };
  }
}

/**
 * 新規ユーザー登録
 * 本命アカウントを作成（ダミーアカウントはCloud Functionsで作成）
 */
export async function registerUser(input: CreateUserInput): Promise<AuthResult> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      input.realEmail,
      input.realPassword
    );

    // ユーザードキュメントはCloud Functionsのトリガーで作成される
    // ここでは追加情報をセッションに保存しておく
    // Cloud Functionsがこの情報を使ってユーザードキュメントを作成する
    sessionStorage.setItem(
      'pendingUserData',
      JSON.stringify({
        dummyEmail: input.dummyEmail,
        dummyPassword: input.dummyPassword,
        nickname: input.nickname,
      })
    );

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    const firebaseError = error as { message?: string; code?: string };
    let errorMessage = 'Registration failed';

    switch (firebaseError.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'このメールアドレスは既に使用されています';
        break;
      case 'auth/weak-password':
        errorMessage = 'パスワードは8文字以上で設定してください';
        break;
      case 'auth/invalid-email':
        errorMessage = 'メールアドレスの形式が正しくありません';
        break;
      default:
        errorMessage = firebaseError.message || 'Registration failed';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * ログアウト
 */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/**
 * 現在の認証ユーザーを取得
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

/**
 * 認証状態の変更を監視
 */
export function onAuthStateChanged(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * パスワードリセットメールを送信
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  await firebaseSendPasswordResetEmail(auth, email);
}

/**
 * メールアドレスの確認メールを送信
 */
export async function sendEmailVerification(): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await firebaseSendEmailVerification(user);
  }
}

/**
 * ユーザードキュメントを取得
 */
export async function getUserDocument(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    return null;
  }
  return userDoc.data() as User;
}

export { auth };
