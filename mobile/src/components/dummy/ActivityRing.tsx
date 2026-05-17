/**
 * ActivityRing - Apple Watch風アクティビティリング
 * ムーブ/エクササイズ/スタンドの3つのリングを表示
 * アニメーション付き
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors, typography, spacing } from '../../theme';
import type { ActivityRings as ActivityRingsType } from '../../data/dummyData';

// AnimatedCircleを作成
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ActivityRingProps {
  rings: ActivityRingsType;
  size?: number;
  strokeWidth?: number;
  animationDuration?: number;
}

const RING_COLORS = {
  move: '#FA114F',    // 赤（ムーブ）
  exercise: '#92E82A', // 緑（エクササイズ）
  stand: '#1EEAEF',   // 青（スタンド）
};

const RING_BG_COLORS = {
  move: '#3D0D1B',
  exercise: '#1D2D0C',
  stand: '#0C2D2E',
};

export const ActivityRing: React.FC<ActivityRingProps> = ({
  rings,
  size = 200,
  strokeWidth = 20,
  animationDuration = 1500,
}) => {
  const center = size / 2;
  const ringGap = strokeWidth + 4;

  // アニメーション用のAnimated.Value
  const moveAnim = useRef(new Animated.Value(0)).current;
  const exerciseAnim = useRef(new Animated.Value(0)).current;
  const standAnim = useRef(new Animated.Value(0)).current;

  // 表示用の値（アニメーション中の値を追跡）
  const [displayValues, setDisplayValues] = useState({
    move: 0,
    exercise: 0,
    stand: 0,
  });

  useEffect(() => {
    // リスナーを設定して表示値を更新
    const moveListener = moveAnim.addListener(({ value }) => {
      setDisplayValues(prev => ({ ...prev, move: Math.round(value) }));
    });
    const exerciseListener = exerciseAnim.addListener(({ value }) => {
      setDisplayValues(prev => ({ ...prev, exercise: Math.round(value) }));
    });
    const standListener = standAnim.addListener(({ value }) => {
      setDisplayValues(prev => ({ ...prev, stand: Math.round(value) }));
    });

    // アニメーションを開始（少し遅延させて画面表示後に開始）
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(moveAnim, {
          toValue: rings.move,
          duration: animationDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(exerciseAnim, {
          toValue: rings.exercise,
          duration: animationDuration,
          delay: 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(standAnim, {
          toValue: rings.stand,
          duration: animationDuration,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    }, 300);

    return () => {
      clearTimeout(timer);
      moveAnim.removeListener(moveListener);
      exerciseAnim.removeListener(exerciseListener);
      standAnim.removeListener(standListener);
    };
  }, [rings, animationDuration, moveAnim, exerciseAnim, standAnim]);

  const renderAnimatedRing = (
    animValue: Animated.Value,
    radius: number,
    color: string,
    bgColor: string
  ) => {
    const circumference = 2 * Math.PI * radius;

    // Animated.Valueから strokeDashoffset を計算
    const strokeDashoffset = animValue.interpolate({
      inputRange: [0, 100],
      outputRange: [circumference, 0],
      extrapolate: 'clamp',
    });

    return (
      <G>
        {/* 背景リング */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* プログレスリング（アニメーション付き） */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </G>
    );
  };

  const outerRadius = center - strokeWidth / 2 - 4;
  const middleRadius = outerRadius - ringGap;
  const innerRadius = middleRadius - ringGap;

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* ムーブリング（外側） */}
          {renderAnimatedRing(moveAnim, outerRadius, RING_COLORS.move, RING_BG_COLORS.move)}
          {/* エクササイズリング（中央） */}
          {renderAnimatedRing(exerciseAnim, middleRadius, RING_COLORS.exercise, RING_BG_COLORS.exercise)}
          {/* スタンドリング（内側） */}
          {renderAnimatedRing(standAnim, innerRadius, RING_COLORS.stand, RING_BG_COLORS.stand)}
        </Svg>
      </View>

      {/* 凡例（アニメーション値を表示） */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: RING_COLORS.move }]} />
          <Text style={styles.legendLabel}>ムーブ</Text>
          <Text style={styles.legendValue}>{displayValues.move}%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: RING_COLORS.exercise }]} />
          <Text style={styles.legendLabel}>エクササイズ</Text>
          <Text style={styles.legendValue}>{displayValues.exercise}%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: RING_COLORS.stand }]} />
          <Text style={styles.legendLabel}>スタンド</Text>
          <Text style={styles.legendValue}>{displayValues.stand}%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ringContainer: {
    backgroundColor: colors.black,
    borderRadius: 1000,
    padding: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  legendItem: {
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: spacing.xs,
  },
  legendLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  legendValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
  },
});
