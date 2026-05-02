/**
 * StepCounter - 歩数カウンターコンポーネント
 * 大きな数字で歩数を表示
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { dailyGoals } from '../../data/dummyData';

interface StepCounterProps {
  steps: number;
  goal?: number;
}

export const StepCounter: React.FC<StepCounterProps> = ({
  steps,
  goal = dailyGoals.steps,
}) => {
  const progress = Math.min((steps / goal) * 100, 100);
  const remaining = Math.max(goal - steps, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>👟</Text>
        <Text style={styles.label}>歩数</Text>
      </View>

      <Text style={styles.steps}>{steps.toLocaleString()}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.goalText}>
          目標 {goal.toLocaleString()} 歩
        </Text>
      </View>

      {remaining > 0 ? (
        <Text style={styles.remainingText}>
          あと {remaining.toLocaleString()} 歩
        </Text>
      ) : (
        <Text style={styles.achievedText}>
          🎉 目標達成！
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.secondary,
  },
  steps: {
    fontSize: 56,
    fontWeight: typography.weights.bold as '700',
    color: colors.primary,
    marginVertical: spacing.md,
  },
  progressContainer: {
    width: '100%',
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  goalText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  remainingText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  achievedText: {
    fontSize: typography.sizes.md,
    color: colors.success,
    fontWeight: typography.weights.semibold as '600',
    marginTop: spacing.md,
  },
});
