/**
 * アプリテーマ定義
 * Design System: "Wellness Serenity"
 * プレミアムなヘルスケア/ウェルネスアプリとして洗練された印象を与えるデザイン
 */

// カラーパレット
export const colors = {
  // プライマリカラー（ティール/エメラルド系 - 信頼感と落ち着き）
  primary: '#0D9488', // Teal-600
  primaryLight: '#14B8A6', // Teal-500
  primaryDark: '#0F766E', // Teal-700
  primaryMuted: '#99F6E4', // Teal-200 (淡いアクセント用)

  // セカンダリカラー（温かみのあるコーラル）
  secondary: '#F97316', // Orange-500
  secondaryLight: '#FB923C', // Orange-400
  secondaryDark: '#EA580C', // Orange-600

  // アクセントカラー（深みのあるインディゴ）
  accent: '#6366F1', // Indigo-500
  accentLight: '#818CF8', // Indigo-400

  // グレースケール（ウォームグレー - 温かみのある中間色）
  white: '#FFFFFF',
  gray50: '#FAFAF9', // Warm gray
  gray100: '#F5F5F4',
  gray200: '#E7E5E4',
  gray300: '#D6D3D1',
  gray400: '#A8A29E',
  gray500: '#78716C',
  gray600: '#57534E',
  gray700: '#44403C',
  gray800: '#292524',
  gray900: '#1C1917',
  black: '#0C0A09',

  // グレースケール（オブジェクト形式）
  gray: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },

  // セマンティックカラー
  success: '#10B981', // Emerald-500
  successLight: '#D1FAE5', // Emerald-100
  warning: '#F59E0B', // Amber-500
  warningLight: '#FEF3C7', // Amber-100
  error: '#EF4444', // Red-500
  errorLight: '#FEE2E2', // Red-100
  info: '#3B82F6', // Blue-500
  infoLight: '#DBEAFE', // Blue-100

  // 背景色（柔らかいオフホワイト）
  background: '#FEFDFB', // 純白より温かみのあるオフホワイト
  backgroundSecondary: '#F5F5F4',
  backgroundTertiary: '#E7E5E4',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // グラデーション用
  gradient: {
    primary: ['#0D9488', '#14B8A6', '#5EEAD4'],
    secondary: ['#F97316', '#FB923C', '#FDBA74'],
    accent: ['#6366F1', '#818CF8', '#A5B4FC'],
    wellness: ['#0D9488', '#10B981', '#34D399'], // ティールからエメラルドへ
    calm: ['#F0FDFA', '#CCFBF1', '#99F6E4'], // 淡いティールグラデーション
  },

  // テキストカラー
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textTertiary: '#78716C',
  textDisabled: '#A8A29E',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',

  // テキストカラー（オブジェクト形式）
  text: {
    primary: '#1C1917',
    secondary: '#57534E',
    tertiary: '#78716C',
    disabled: '#A8A29E',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
  },

  // ボーダー
  border: '#E7E5E4',
  borderLight: '#F5F5F4',
  divider: '#E7E5E4',

  // オーバーレイ
  overlay: 'rgba(28, 25, 23, 0.5)',
  overlayLight: 'rgba(28, 25, 23, 0.3)',

  // LINE風ダークテーマ
  lineDark: {
    background: '#121212',
    surface: '#1E1E1E',
    surfaceElevated: '#2A2A2A',
    header: '#1A1A1A',
    border: '#333333',
    green: '#06C755',
    greenLight: '#08E065',
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#636366',
    searchBg: '#2C2C2E',
    unreadBadge: '#06C755',
  },
} as const;

// タイポグラフィ
export const typography = {
  // フォントファミリー（システムフォントを活用）
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  // フォントサイズ（より大きめで読みやすく）
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 19,
    '2xl': 22,
    '3xl': 26,
    '4xl': 32,
    '5xl': 38,
    '6xl': 48,
  },

  // フォントサイズ（エイリアス）
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 19,
    '2xl': 22,
    '3xl': 26,
    '4xl': 32,
    '5xl': 38,
    '6xl': 48,
  },

  // フォントウェイト
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // フォントウェイト（エイリアス）
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // 行の高さ
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 1.75,
  },

  // レターースペーシング
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

// スペーシング（より余裕のある間隔）
export const spacing = {
  none: 0,
  '2xs': 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
} as const;

// 角丸（大きめで柔らかい印象）
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// シャドウ（柔らかいシャドウ）
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  // カラーシャドウ（プライマリカラーのグロー効果）
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// テーマオブジェクト
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
