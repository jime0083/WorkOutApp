/**
 * Jest設定 - React Native (iOS)
 */
module.exports = {
  preset: '@react-native/jest-preset',

  // テストファイルのパターン
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{ts,tsx}',
  ],

  // モジュール解決
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // トランスフォーム対象外
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-firebase|react-native-iap|react-native-screenshot-prevent|react-native-safe-area-context|react-native-localize)/)',
  ],

  // カバレッジ設定
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/**/__tests__/**',
  ],

  // カバレッジ閾値
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // テスト環境
  testEnvironment: 'node',

  // タイムアウト
  testTimeout: 10000,
};
