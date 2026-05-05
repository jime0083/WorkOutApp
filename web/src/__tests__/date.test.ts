/**
 * date.ts ユニットテスト
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatRelativeTime,
  formatMessageTime,
  formatDateSeparator,
  isSameDay,
} from '../utils/date';

describe('date utils', () => {
  beforeEach(() => {
    // 固定の日時を設定（2026年5月4日 12:00:00）
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-04T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatRelativeTime', () => {
    it('1分未満は「たった今」を返す', () => {
      const date = new Date('2026-05-04T11:59:30');
      expect(formatRelativeTime(date)).toBe('たった今');
    });

    it('1分前は「1分前」を返す', () => {
      const date = new Date('2026-05-04T11:59:00');
      expect(formatRelativeTime(date)).toBe('1分前');
    });

    it('30分前は「30分前」を返す', () => {
      const date = new Date('2026-05-04T11:30:00');
      expect(formatRelativeTime(date)).toBe('30分前');
    });

    it('1時間前は「1時間前」を返す', () => {
      const date = new Date('2026-05-04T11:00:00');
      expect(formatRelativeTime(date)).toBe('1時間前');
    });

    it('5時間前は「5時間前」を返す', () => {
      const date = new Date('2026-05-04T07:00:00');
      expect(formatRelativeTime(date)).toBe('5時間前');
    });

    it('1日前は「1日前」を返す', () => {
      const date = new Date('2026-05-03T12:00:00');
      expect(formatRelativeTime(date)).toBe('1日前');
    });

    it('6日前は「6日前」を返す', () => {
      const date = new Date('2026-04-28T12:00:00');
      expect(formatRelativeTime(date)).toBe('6日前');
    });

    it('7日以上前は日付形式を返す（同年）', () => {
      const date = new Date('2026-04-20T12:00:00');
      expect(formatRelativeTime(date)).toBe('4/20');
    });

    it('前年は年付きの日付形式を返す', () => {
      const date = new Date('2025-12-25T12:00:00');
      expect(formatRelativeTime(date)).toBe('2025/12/25');
    });
  });

  describe('formatMessageTime', () => {
    it('午前の時間を正しくフォーマットする', () => {
      const date = new Date('2026-05-04T09:05:00');
      expect(formatMessageTime(date)).toBe('9:05');
    });

    it('午後の時間を正しくフォーマットする', () => {
      const date = new Date('2026-05-04T15:30:00');
      expect(formatMessageTime(date)).toBe('15:30');
    });

    it('0時を正しくフォーマットする', () => {
      const date = new Date('2026-05-04T00:00:00');
      expect(formatMessageTime(date)).toBe('0:00');
    });

    it('分が1桁の場合は0埋めする', () => {
      const date = new Date('2026-05-04T12:05:00');
      expect(formatMessageTime(date)).toBe('12:05');
    });
  });

  describe('formatDateSeparator', () => {
    it('今日は「今日」を返す', () => {
      const date = new Date('2026-05-04T09:00:00');
      expect(formatDateSeparator(date)).toBe('今日');
    });

    it('昨日は「昨日」を返す', () => {
      const date = new Date('2026-05-03T09:00:00');
      expect(formatDateSeparator(date)).toBe('昨日');
    });

    it('同年の過去日は月日と曜日を返す', () => {
      const date = new Date('2026-04-20T09:00:00'); // 月曜日
      expect(formatDateSeparator(date)).toBe('4月20日（月）');
    });

    it('異なる年は年月日と曜日を返す', () => {
      const date = new Date('2025-12-25T09:00:00'); // 木曜日
      expect(formatDateSeparator(date)).toBe('2025年12月25日（木）');
    });
  });

  describe('isSameDay', () => {
    it('同じ日は true を返す', () => {
      const date1 = new Date('2026-05-04T09:00:00');
      const date2 = new Date('2026-05-04T18:00:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('異なる日は false を返す', () => {
      const date1 = new Date('2026-05-04T09:00:00');
      const date2 = new Date('2026-05-05T09:00:00');
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('異なる月は false を返す', () => {
      const date1 = new Date('2026-05-04T09:00:00');
      const date2 = new Date('2026-06-04T09:00:00');
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it('異なる年は false を返す', () => {
      const date1 = new Date('2026-05-04T09:00:00');
      const date2 = new Date('2025-05-04T09:00:00');
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });
});
