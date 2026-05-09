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
  const currentUser = auth().currentUser;
  if (!currentUser) {
    return {
      success: false,
      authType: null,
      error: 'Not logged in',
    };
  }

  try {
    // 現在のユーザーのドキュメントを取得
    const userDoc = await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .get();

    if (!userDoc.exists) {
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
        const credential = auth.EmailAuthProvider.credential(email, password);
        await currentUser.reauthenticateWithCredential(credential);
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
      // ダミーパスワードをチェック（userDataにdummyPasswordHashがある場合）
      // 注意: セキュアな実装ではCloud Functionsでパスワード検証を行う
      // 簡易実装として、ダミーメールが一致すればダミー認証とする
      // 実際のパスワード検証はCloud Functionsで行う必要がある
      try {
        // ダミーアカウントでサインインを試行
        const dummyCredential = await auth().signInWithEmailAndPassword(
          email,
          password
        );
        // 同じユーザーであることを確認
        if (dummyCredential.user.uid === currentUser.uid) {
          return {
            success: true,
            authType: 'dummy',
          };
        }
        // 異なるユーザーだった場合はサインアウト
        await auth().signOut();
        // 元のユーザーで再サインイン（できない場合はエラー）
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

export { auth };
