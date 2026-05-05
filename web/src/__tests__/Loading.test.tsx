/**
 * Loading コンポーネント ユニットテスト
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading, FullScreenLoading, CenteredLoading } from '../components/Loading';

describe('Loading', () => {
  describe('Loading（インライン）', () => {
    it('レンダリングされる', () => {
      const { container } = render(<Loading />);
      expect(container.querySelector('[class*="spinner"]')).toBeTruthy();
    });

    it('テキストが表示される', () => {
      render(<Loading text="読み込み中..." />);
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    it('テキストなしでもレンダリングされる', () => {
      const { container } = render(<Loading />);
      expect(container.querySelector('[class*="spinner"]')).toBeTruthy();
      expect(container.querySelector('[class*="text"]')).toBeFalsy();
    });

    it('カスタムクラス名が適用される', () => {
      const { container } = render(<Loading className="custom-class" />);
      expect(container.querySelector('.custom-class')).toBeTruthy();
    });

    it('サイズ sm が適用される', () => {
      const { container } = render(<Loading size="sm" />);
      expect(container.querySelector('[class*="sm"]')).toBeTruthy();
    });

    it('サイズ lg が適用される', () => {
      const { container } = render(<Loading size="lg" />);
      expect(container.querySelector('[class*="lg"]')).toBeTruthy();
    });

    it('デフォルトサイズは md', () => {
      const { container } = render(<Loading />);
      expect(container.querySelector('[class*="md"]')).toBeTruthy();
    });
  });

  describe('FullScreenLoading', () => {
    it('visible=true でレンダリングされる', () => {
      const { container } = render(<FullScreenLoading visible={true} />);
      expect(container.querySelector('[class*="overlay"]')).toBeTruthy();
    });

    it('visible=false で何もレンダリングしない', () => {
      const { container } = render(<FullScreenLoading visible={false} />);
      expect(container.querySelector('[class*="overlay"]')).toBeFalsy();
    });

    it('デフォルトでvisible', () => {
      const { container } = render(<FullScreenLoading />);
      expect(container.querySelector('[class*="overlay"]')).toBeTruthy();
    });

    it('テキストが表示される', () => {
      render(<FullScreenLoading text="処理中..." />);
      expect(screen.getByText('処理中...')).toBeInTheDocument();
    });
  });

  describe('CenteredLoading', () => {
    it('レンダリングされる', () => {
      const { container } = render(<CenteredLoading />);
      expect(container.querySelector('[class*="centered"]')).toBeTruthy();
    });

    it('テキストが表示される', () => {
      render(<CenteredLoading text="お待ちください..." />);
      expect(screen.getByText('お待ちください...')).toBeInTheDocument();
    });

    it('デフォルトサイズは lg', () => {
      const { container } = render(<CenteredLoading />);
      expect(container.querySelector('[class*="lg"]')).toBeTruthy();
    });

    it('サイズ sm が適用される', () => {
      const { container } = render(<CenteredLoading size="sm" />);
      expect(container.querySelector('[class*="sm"]')).toBeTruthy();
    });
  });
});
