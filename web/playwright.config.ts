/**
 * Playwright E2E テスト設定
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // テストディレクトリ
  testDir: './e2e',

  // 並列実行
  fullyParallel: true,

  // CI環境ではリトライしない
  forbidOnly: !!process.env.CI,

  // リトライ回数
  retries: process.env.CI ? 2 : 0,

  // 並列ワーカー数
  workers: process.env.CI ? 1 : undefined,

  // レポーター
  reporter: 'html',

  // 共通設定
  use: {
    // ベースURL（開発サーバー）
    baseURL: 'http://localhost:5173',

    // トレース設定（失敗時のみ）
    trace: 'on-first-retry',

    // スクリーンショット設定
    screenshot: 'only-on-failure',

    // ビデオ設定
    video: 'on-first-retry',
  },

  // プロジェクト（ブラウザ）設定
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // モバイル
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // 開発サーバー設定
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // タイムアウト設定
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
});
