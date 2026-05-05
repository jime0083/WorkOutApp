/**
 * Jest設定 - Cloud Functions
 */
module.exports = {
  preset: 'ts-jest',

  // テスト環境
  testEnvironment: 'node',

  // ルートディレクトリ
  roots: ['<rootDir>/src'],

  // テストファイルのパターン
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/*.test.ts',
  ],

  // トランスフォーム
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  // モジュール解決
  moduleFileExtensions: ['ts', 'js', 'json'],

  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // カバレッジ設定
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
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

  // タイムアウト
  testTimeout: 30000,

  // 詳細出力
  verbose: true,
};
