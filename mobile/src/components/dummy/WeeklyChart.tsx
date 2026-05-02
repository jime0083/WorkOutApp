/**
 * WeeklyChart - 週間データグラフ
 * 棒グラフで1週間のデータを表示
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import type { WeeklyData } from '../../data/dummyData';

interface WeeklyChartProps {
  data: WeeklyData[];
  dataKey: 'steps' | 'calories';
  title: string;
  color?: string;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({
  data,
  dataKey,
  title,
  color = colors.primary,
}) => {
  const maxValue = Math.max(...data.map(d => d[dataKey]));
  const todayIndex = new Date().getDay();
  // 日曜日は0なので、月曜日を0にする調整
  const adjustedTodayIndex = todayIndex === 0 ? 6 : todayIndex - 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const barHeight = (item[dataKey] / maxValue) * 120;
          const isToday = index === adjustedTodayIndex;

          return (
            <View key={item.day} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: isToday ? color : colors.gray[300],
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  isToday && styles.todayLabel,
                ]}
              >
                {item.day}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>今週の平均</Text>
          <Text style={styles.statValue}>
            {Math.round(
              data.reduce((sum, d) => sum + d[dataKey], 0) / data.length
            ).toLocaleString()}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>今週の合計</Text>
          <Text style={styles.statValue}>
            {data.reduce((sum, d) => sum + d[dataKey], 0).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingHorizontal: spacing.xs,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  todayLabel: {
    color: colors.primary,
    fontWeight: typography.weights.bold as '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
  },
});
