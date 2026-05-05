/**
 * 認証フロー E2E テスト
 */
import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test.describe('ログインページ', () => {
    test('ログインページが表示される', async ({ page }) => {
      await page.goto('/login');

      // ページタイトルを確認
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // メールアドレス入力欄が存在
      await expect(page.locator('input[type="email"]')).toBeVisible();

      // パスワード入力欄が存在
      await expect(page.locator('input[type="password"]')).toBeVisible();

      // ログインボタンが存在
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('空のフォームでエラーが表示される', async ({ page }) => {
      await page.goto('/login');

      // ログインボタンをクリック
      await page.locator('button[type="submit"]').click();

      // エラーメッセージが表示される
      await expect(page.locator('[class*="error"], [role="alert"]')).toBeVisible();
    });

    test('新規登録ページへのリンクが機能する', async ({ page }) => {
      await page.goto('/login');

      // 新規登録リンクをクリック
      await page.locator('a[href*="register"]').click();

      // 登録ページに遷移
      await expect(page).toHaveURL(/register/);
    });
  });

  test.describe('新規登録ページ', () => {
    test('新規登録ページが表示される', async ({ page }) => {
      await page.goto('/register');

      // ページタイトルを確認
      await expect(page.locator('h1, h2').first()).toBeVisible();

      // メールアドレス入力欄が存在
      await expect(page.locator('input[type="email"]').first()).toBeVisible();

      // パスワード入力欄が存在
      await expect(page.locator('input[type="password"]').first()).toBeVisible();

      // 登録ボタンが存在
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('ログインページへのリンクが機能する', async ({ page }) => {
      await page.goto('/register');

      // ログインリンクをクリック
      await page.locator('a[href*="login"]').click();

      // ログインページに遷移
      await expect(page).toHaveURL(/login/);
    });
  });

  test.describe('保護されたルート', () => {
    test('未認証ユーザーはホームページからログインにリダイレクトされる', async ({
      page,
    }) => {
      await page.goto('/');

      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL(/login/);
    });

    test('未認証ユーザーは友だちページにアクセスできない', async ({ page }) => {
      await page.goto('/friends');

      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL(/login/);
    });

    test('未認証ユーザーはプロフィールページにアクセスできない', async ({
      page,
    }) => {
      await page.goto('/profile');

      // ログインページにリダイレクトされることを確認
      await expect(page).toHaveURL(/login/);
    });
  });
});

test.describe('ナビゲーション', () => {
  test('ログインページのレスポンシブデザイン', async ({ page }) => {
    await page.goto('/login');

    // モバイルサイズ
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('form')).toBeVisible();

    // タブレットサイズ
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('form')).toBeVisible();

    // デスクトップサイズ
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('form')).toBeVisible();
  });
});
