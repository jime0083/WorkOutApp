/**
 * ActivityRing - Apple Watch風アクティビティリング
 * ムーブ/エクササイズ/スタンドの3つのリングを表示
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors, typography, spacing } from '../../theme';
import type { ActivityRings as ActivityRingsType } from '../../data/dummyData';

interface ActivityRingProps {
  rings: ActivityRingsType;
  size?: number;
  strokeWidth?: number;
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
}) => {
  const center = size / 2;
  const ringGap = strokeWidth + 4;

  const renderRing = (
    progress: number,
    radius: number,
    color: string,
    bgColor: string
  ) => {
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - Math.min(progress / 100, 1));

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
        {/* プログレスリング */}
        <Circle
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
          {renderRing(rings.move, outerRadius, RING_COLORS.move, RING_BG_COLORS.move)}
          {/* エクササイズリング（中央） */}
          {renderRing(rings.exercise, middleRadius, RING_COLORS.exercise, RING_BG_COLORS.exercise)}
          {/* スタンドリング（内側） */}
          {renderRing(rings.stand, innerRadius, RING_COLORS.stand, RING_BG_COLORS.stand)}
        </Svg>
      </View>

      {/* 凡例 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: RING_COLORS.move }]} />
          <Text style={styles.legendLabel}>ムーブ</Text>
          <Text style={styles.legendValue}>{rings.move}%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: RING_COLORS.exercise }]} />
          <Text style={styles.legendLabel}>エクササイズ</Text>
          <Text style={styles.legendValue}>{rings.exercise}%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: RING_COLORS.stand }]} />
          <Text style={styles.legendLabel}>スタンド</Text>
          <Text style={styles.legendValue}>{rings.stand}%</Text>
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
