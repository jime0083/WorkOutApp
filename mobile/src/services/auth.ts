/**
 * Firebase認証サービス（Firebase JS SDK）
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
} from 'firebase/firestore';
import { getAuthInstance, getFirestoreInstance } from './firebase';
import type { User, CreateUserInput } from '../types/user';

// 認証結果型
export interface AuthResult {
  success: boolean;
  user?: FirebaseUser;
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
    const auth = getAuthInstance();
    const db = getFirestoreInstance();

    // まず入力されたメールアドレスでログインを試行
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
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
    const auth = getAuthInstance();

    // 本命アカウントを作成
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      input.realEmail,
      input.realPassword
    );

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}

/**
 * ログアウト
 */
export async function logout(): Promise<void> {
  const auth = getAuthInstance();
  await signOut(auth);
}

/**
 * 現在の認証ユーザーを取得
 */
export function getCurrentUser(): FirebaseUser | null {
  const auth = getAuthInstance();
  return auth.currentUser;
}

/**
 * 認証状態の変更を監視
 */
export function onAuthStateChanged(
  callback: (user: FirebaseUser | null) => void
): () => void {
  const auth = getAuthInstance();
  return firebaseOnAuthStateChanged(auth, callback);
}

/**
 * パスワードリセットメールを送信
 */
export async function sendPasswordResetEmail(email: string): Promise<void> {
  const auth = getAuthInstance();
  await firebaseSendPasswordResetEmail(auth, email);
}

/**
 * メールアドレスの確認メールを送信
 */
export async function sendEmailVerification(): Promise<void> {
  const auth = getAuthInstance();
  const user = auth.currentUser;
  if (user) {
    await firebaseSendEmailVerification(user);
  }
}

/**
 * ユーザードキュメントを取得
 */
export async function getUserDocument(userId: string): Promise<User | null> {
  const db = getFirestoreInstance();
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    return null;
  }
  return userDoc.data() as User;
}

/**
 * 認証情報を検証（サインインせずに認証タイプを判定）
 * 既にログイン中のユーザーの本物/ダミー認証情報を検証
 */
export interface VerifyResult {
  success: boolean;
  authType: 'real' | 'dummy' | null;
  error?: string;
}

export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<VerifyResult> {
  const auth = getAuthInstance();
  const db = getFirestoreInstance();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return {
      success: false,
      authType: null,
      error: 'Not logged in',
    };
  }

  try {
    // 現在のユーザーのドキュメントを取得
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

    if (!userDoc.exists()) {
      return {
        success: false,
        authType: null,
        error: 'User document not found',
      };
    }

    const userData = userDoc.data() as User;

    // 本物のメールアドレスで認証を試行
    if (email === userData.realEmail || email === currentUser.email) {
      try {
        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(currentUser, credential);
        return {
          success: true,
          authType: 'real',
        };
      } catch {
        // 本物の認証に失敗
      }
    }

    // ダミーのメールアドレスで認証を試行
    if (email === userData.dummyEmail) {
      try {
        const dummyCredential = await signInWithEmailAndPassword(auth, email, password);
        if (dummyCredential.user.uid === currentUser.uid) {
          return {
            success: true,
            authType: 'dummy',
          };
        }
        await signOut(auth);
        return {
          success: false,
          authType: null,
          error: 'Invalid credentials',
        };
      } catch {
        // ダミー認証に失敗
      }
    }

    return {
      success: false,
      authType: null,
      error: 'Invalid email or password',
    };
  } catch (error) {
    return {
      success: false,
      authType: null,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}
