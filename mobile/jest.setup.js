/**
 * Jest セットアップファイル - React Native (iOS)
 */

// Firebase モック
jest.mock('@react-native-firebase/app', () => ({
  firebase: {
    app: jest.fn(() => ({
      name: '[DEFAULT]',
    })),
  },
}));

jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
  })),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    collection: jest.fn(),
    doc: jest.fn(),
  })),
}));

jest.mock('@react-native-firebase/functions', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    httpsCallable: jest.fn(),
  })),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    requestPermission: jest.fn(),
    getToken: jest.fn(),
    onMessage: jest.fn(),
    onNotificationOpenedApp: jest.fn(),
    getInitialNotification: jest.fn(),
  })),
}));

// react-native-iap モック
jest.mock('react-native-iap', () => ({
  initConnection: jest.fn(),
  endConnection: jest.fn(),
  getSubscriptions: jest.fn(),
  requestSubscription: jest.fn(),
  finishTransaction: jest.fn(),
  purchaseUpdatedListener: jest.fn(),
  purchaseErrorListener: jest.fn(),
}));

// react-native-screenshot-prevent モック
jest.mock('react-native-screenshot-prevent', () => ({
  enableSecureView: jest.fn(),
  disableSecureView: jest.fn(),
  addListener: jest.fn(),
}));

// react-native-safe-area-context モック
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// react-native-localize モック
jest.mock('react-native-localize', () => ({
  getLocales: () => [{ languageCode: 'ja', countryCode: 'JP' }],
  findBestLanguageTag: () => ({ languageTag: 'ja', isRTL: false }),
}));

// i18next モック
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'ja',
      changeLanguage: jest.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Console warnings を抑制
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
