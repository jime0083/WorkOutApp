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
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuthInstance, getFirestoreInstance } from './firebase';
import type { User, CreateUserInput } from '../types/user';
import { verifyPassword, hashPassword } from '../types/user';

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
 * email + password1 でFirebase認証を行う
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    const auth = getAuthInstance();

    // メールアドレス + パスワード1 でログイン
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    return {
      success: true,
      user: userCredential.user,
      isDummyLogin: false,  // ログイン時は常にパスワード1（本物）
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
 * ランダムな表示用ユーザーIDを生成
 */
function generateVisibleUserId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * ランダムな招待コードを生成（8文字の英数字）
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 紛らわしい文字(0,O,1,I)を除外
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 新規ユーザー登録
 * email + password1 でFirebase Auth アカウントを作成
 * password2はハッシュ化してFirestoreに保存
 */
export async function registerUser(input: CreateUserInput): Promise<AuthResult> {
  try {
    const auth = getAuthInstance();
    const db = getFirestoreInstance();

    console.log('[AUTH] Starting registration for:', input.email);

    // メールアドレス + パスワード1 でFirebase Authアカウントを作成
    console.log('[AUTH] Creating Firebase Auth account...');
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      input.email,
      input.password1
    );
    console.log('[AUTH] Firebase Auth account created, UID:', userCredential.user.uid);

    // パスワード2をハッシュ化
    const password2Hash = hashPassword(input.password2);
    console.log('[AUTH] Password2 hashed');

    // ユーザードキュメントを作成
    console.log('[AUTH] Creating Firestore user document...');
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDocRef, {
      id: userCredential.user.uid,
      email: input.email,
      password2Hash: password2Hash,
      visibleUserId: generateVisibleUserId(),
      inviteCode: generateInviteCode(),
      nickname: input.nickname || '',
      profileImageUrl: null,
      subscriptionStatus: 'free',
      subscriptionPlan: null,
      subscriptionExpiry: null,
      monthlyMessageCount: 0,
      messageCountResetDate: new Date(),
      fcmToken: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    console.log('[AUTH] Firestore user document created successfully');

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    console.error('[AUTH] Registration error:', error);
    console.error('[AUTH] Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('[AUTH] Error code:', (error as { code?: string })?.code);
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
 * 認証情報を検証（パスワードのみで認証タイプを判定）
 * パスワード1: Firebase Auth再認証で検証 → 'real'
 * パスワード2: Firestoreのpassword2Hashと比較 → 'dummy'
 */
export interface VerifyResult {
  success: boolean;
  authType: 'real' | 'dummy' | null;
  error?: string;
}

export async function verifyUserCredentials(
  password: string
): Promise<VerifyResult> {
  const auth = getAuthInstance();
  const db = getFirestoreInstance();
  const currentUser = auth.currentUser;

  if (!currentUser || !currentUser.email) {
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

    // まずパスワード2（ダミー）のハッシュと比較
    // パスワード2がFirestoreに保存されている場合
    if (userData.password2Hash) {
      const isPassword2 = verifyPassword(password, userData.password2Hash);
      if (isPassword2) {
        return {
          success: true,
          authType: 'dummy',
        };
      }
    }

    // パスワード1（本物）で再認証を試行
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      return {
        success: true,
        authType: 'real',
      };
    } catch {
      // パスワード1の認証にも失敗
    }

    return {
      success: false,
      authType: null,
      error: 'Invalid password',
    };
  } catch (error) {
    return {
      success: false,
      authType: null,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}
