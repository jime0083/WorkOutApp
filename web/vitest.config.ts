/**
 * Vitest設定 - Web
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  test: {
    // テスト環境
    environment: 'jsdom',

    // グローバルAPI（describe, it, expect）
    globals: true,

    // セットアップファイル
    setupFiles: ['./vitest.setup.ts'],

    // テストファイルのパターン
    include: ['src/**/*.{test,spec}.{ts,tsx}'],

    // 除外パターン
    exclude: ['node_modules', 'dist'],

    // カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.{ts,tsx}',
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },

    // タイムアウト
    testTimeout: 10000,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
