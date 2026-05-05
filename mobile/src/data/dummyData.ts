/**
 * ダミー運動データ
 * 偽装用の健康・フィットネスデータ
 */

// 今日の運動データ
export interface TodayStats {
  steps: number;
  calories: number;
  distance: number; // km
  activeMinutes: number;
  standHours: number;
  exerciseMinutes: number;
}

// 週間データ
export interface WeeklyData {
  day: string;
  steps: number;
  calories: number;
}

// アクティビティリング
export interface ActivityRings {
  move: number; // 0-100%
  exercise: number; // 0-100%
  stand: number; // 0-100%
}

// 心拍数データ
export interface HeartRateData {
  current: number;
  resting: number;
  walking: number;
  max: number;
}

// 睡眠データ
export interface SleepData {
  hours: number;
  minutes: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
}

// ワークアウト履歴
export interface Workout {
  id: string;
  type: 'walking' | 'running' | 'cycling' | 'swimming' | 'yoga' | 'strength';
  date: Date;
  duration: number; // minutes
  calories: number;
  distance?: number; // km
}

// 今日の統計（固定データ）
export const todayStats: TodayStats = {
  steps: 8432,
  calories: 523,
  distance: 6.2,
  activeMinutes: 45,
  standHours: 10,
  exerciseMinutes: 32,
};

// アクティビティリング（固定データ）
export const activityRings: ActivityRings = {
  move: 78,
  exercise: 85,
  stand: 83,
};

// 心拍数データ（固定データ）
export const heartRateData: HeartRateData = {
  current: 72,
  resting: 58,
  walking: 95,
  max: 165,
};

// 睡眠データ（固定データ）
export const sleepData: SleepData = {
  hours: 7,
  minutes: 23,
  quality: 'good',
};

// 週間データ（固定データ）
export const weeklyData: WeeklyData[] = [
  { day: '月', steps: 9234, calories: 612 },
  { day: '火', steps: 7821, calories: 498 },
  { day: '水', steps: 10521, calories: 723 },
  { day: '木', steps: 6432, calories: 412 },
  { day: '金', steps: 8932, calories: 589 },
  { day: '土', steps: 12432, calories: 821 },
  { day: '日', steps: 8432, calories: 523 },
];

// 最近のワークアウト（固定データ）
export const recentWorkouts: Workout[] = [
  {
    id: '1',
    type: 'walking',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2時間前
    duration: 35,
    calories: 156,
    distance: 2.8,
  },
  {
    id: '2',
    type: 'running',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1日前
    duration: 28,
    calories: 312,
    distance: 4.2,
  },
  {
    id: '3',
    type: 'yoga',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2日前
    duration: 45,
    calories: 128,
  },
  {
    id: '4',
    type: 'cycling',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3日前
    duration: 52,
    calories: 423,
    distance: 15.3,
  },
  {
    id: '5',
    type: 'strength',
    date: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4日前
    duration: 40,
    calories: 245,
  },
];

// 目標設定（固定データ）
export const dailyGoals = {
  steps: 10000,
  calories: 600,
  activeMinutes: 60,
  standHours: 12,
  exerciseMinutes: 30,
};

// ワークアウトタイプのラベル
export const workoutTypeLabels: Record<Workout['type'], string> = {
  walking: 'ウォーキング',
  running: 'ランニング',
  cycling: 'サイクリング',
  swimming: '水泳',
  yoga: 'ヨガ',
  strength: '筋力トレーニング',
};

// ワークアウトタイプのアイコン名（SF Symbols互換）
export const workoutTypeIcons: Record<Workout['type'], string> = {
  walking: 'figure.walk',
  running: 'figure.run',
  cycling: 'bicycle',
  swimming: 'figure.pool.swim',
  yoga: 'figure.yoga',
  strength: 'dumbbell.fill',
};

// 時間フォーマット用ヘルパー
export function formatDuration(minutes: number, locale: string = 'ja-JP'): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const isJapanese = locale.startsWith('ja');

  if (hours > 0) {
    return isJapanese ? `${hours}時間${mins}分` : `${hours}h ${mins}m`;
  }
  return isJapanese ? `${mins}分` : `${mins}m`;
}

// 距離フォーマット用ヘルパー
export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

// カロリーフォーマット用ヘルパー
export function formatCalories(cal: number): string {
  return `${cal} kcal`;
}

// 日付フォーマット用ヘルパー
export function formatWorkoutDate(date: Date, locale: string = 'ja-JP'): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const isJapanese = locale.startsWith('ja');

  if (diffHours < 1) {
    return isJapanese ? '直前' : 'Just now';
  } else if (diffHours < 24) {
    return isJapanese ? `${diffHours}時間前` : `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return isJapanese ? '昨日' : 'Yesterday';
  } else if (diffDays < 7) {
    return isJapanese ? `${diffDays}日前` : `${diffDays} days ago`;
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
}
