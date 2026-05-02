/**
 * DummyStatsScreen - ダミー統計画面
 * 週間データや履歴を表示
 */
import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { WeeklyChart, HealthCard } from '../../components/dummy';
import {
  weeklyData,
  recentWorkouts,
  workoutTypeLabels,
  formatDuration,
  formatDistance,
  formatCalories,
  formatWorkoutDate,
} from '../../data/dummyData';

interface DummyStatsScreenProps {
  navigation?: unknown;
}

export const DummyStatsScreen: React.FC<DummyStatsScreenProps> = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <Text style={styles.title}>統計</Text>

        {/* 週間歩数チャート */}
        <View style={styles.section}>
          <WeeklyChart
            data={weeklyData}
            dataKey="steps"
            title="週間歩数"
            color={colors.primary}
          />
        </View>

        {/* 週間カロリーチャート */}
        <View style={styles.section}>
          <WeeklyChart
            data={weeklyData}
            dataKey="calories"
            title="週間消費カロリー"
            color="#FA114F"
          />
        </View>

        {/* 最近のワークアウト */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近のワークアウト</Text>
          {recentWorkouts.map((workout) => (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <View style={styles.workoutIconContainer}>
                  <Text style={styles.workoutIcon}>
                    {workout.type === 'walking' && '🚶'}
                    {workout.type === 'running' && '🏃'}
                    {workout.type === 'cycling' && '🚴'}
                    {workout.type === 'swimming' && '🏊'}
                    {workout.type === 'yoga' && '🧘'}
                    {workout.type === 'strength' && '💪'}
                  </Text>
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutType}>
                    {workoutTypeLabels[workout.type]}
                  </Text>
                  <Text style={styles.workoutDate}>
                    {formatWorkoutDate(workout.date)}
                  </Text>
                </View>
              </View>
              <View style={styles.workoutStats}>
                <View style={styles.workoutStat}>
                  <Text style={styles.workoutStatLabel}>時間</Text>
                  <Text style={styles.workoutStatValue}>
                    {formatDuration(workout.duration)}
                  </Text>
                </View>
                <View style={styles.workoutStat}>
                  <Text style={styles.workoutStatLabel}>カロリー</Text>
                  <Text style={styles.workoutStatValue}>
                    {formatCalories(workout.calories)}
                  </Text>
                </View>
                {workout.distance && (
                  <View style={styles.workoutStat}>
                    <Text style={styles.workoutStatLabel}>距離</Text>
                    <Text style={styles.workoutStatValue}>
                      {formatDistance(workout.distance)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* トレンドカード */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>トレンド</Text>
          <View style={styles.trendGrid}>
            <View style={styles.trendCard}>
              <HealthCard
                title="平均歩数"
                value={Math.round(
                  weeklyData.reduce((sum, d) => sum + d.steps, 0) / 7
                ).toLocaleString()}
                unit="歩/日"
                color={colors.primary}
                subtitle="過去7日間"
              />
            </View>
            <View style={styles.trendCard}>
              <HealthCard
                title="平均カロリー"
                value={Math.round(
                  weeklyData.reduce((sum, d) => sum + d.calories, 0) / 7
                )}
                unit="kcal/日"
                color="#FA114F"
                subtitle="過去7日間"
              />
            </View>
          </View>
        </View>

        {/* スペーサー */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  workoutCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  workoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  workoutIcon: {
    fontSize: 20,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutType: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
  },
  workoutDate: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  workoutStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  workoutStat: {
    flex: 1,
  },
  workoutStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  workoutStatValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as '500',
    color: colors.text.primary,
  },
  trendGrid: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
  },
  trendCard: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
