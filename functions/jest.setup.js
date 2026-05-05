/**
 * Jest セットアップファイル - Cloud Functions
 */
const firebaseFunctionsTest = require('firebase-functions-test');

// Firebase Functions テスト環境を初期化（オフラインモード）
const testEnv = firebaseFunctionsTest();

// グローバルに公開
global.testEnv = testEnv;

// テスト終了後のクリーンアップ
afterAll(() => {
  testEnv.cleanup();
});

// Firebase Admin モック
jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase-admin/firestore', () => {
  const mockTimestamp = {
    now: jest.fn(() => ({ toDate: () => new Date() })),
    fromDate: jest.fn((date) => ({ toDate: () => date })),
  };

  const mockFieldValue = {
    serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP'),
    increment: jest.fn((n) => `INCREMENT_${n}`),
    arrayUnion: jest.fn((...items) => `ARRAY_UNION_${items.join(',')}`),
    arrayRemove: jest.fn((...items) => `ARRAY_REMOVE_${items.join(',')}`),
    delete: jest.fn(() => 'DELETE'),
  };

  return {
    getFirestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
          collection: jest.fn(),
        })),
        where: jest.fn(() => ({
          get: jest.fn(),
          where: jest.fn(),
          orderBy: jest.fn(),
          limit: jest.fn(),
        })),
        add: jest.fn(),
      })),
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      batch: jest.fn(() => ({
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn(),
      })),
      runTransaction: jest.fn(),
    })),
    Timestamp: mockTimestamp,
    FieldValue: mockFieldValue,
  };
});

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    getUser: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  })),
}));

jest.mock('firebase-admin/storage', () => ({
  getStorage: jest.fn(() => ({
    bucket: jest.fn(() => ({
      file: jest.fn(() => ({
        delete: jest.fn(),
        exists: jest.fn(),
        getSignedUrl: jest.fn(),
      })),
      getFiles: jest.fn(() => [[]]),
    })),
  })),
}));

jest.mock('firebase-admin/messaging', () => ({
  getMessaging: jest.fn(() => ({
    send: jest.fn(),
    sendMulticast: jest.fn(),
  })),
}));

// Console を抑制（必要に応じてコメントアウト）
// global.console = {
//   ...console,
//   log: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };
