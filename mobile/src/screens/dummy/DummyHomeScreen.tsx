/**
 * DummyHomeScreen - ダミーホーム画面
 * Apple Health風のフィットネスダッシュボード
 */
import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import {
  StepCounter,
  ActivityRing,
  HealthCard,
} from '../../components/dummy';
import {
  todayStats,
  activityRings,
  heartRateData,
  sleepData,
} from '../../data/dummyData';

interface DummyHomeScreenProps {
  navigation?: unknown;
}

export const DummyHomeScreen: React.FC<DummyHomeScreenProps> = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.greeting}>おはようございます</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('ja-JP', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </Text>
        </View>

        {/* アクティビティリング */}
        <TouchableOpacity style={styles.section} activeOpacity={0.9}>
          <Text style={styles.sectionTitle}>アクティビティ</Text>
          <ActivityRing rings={activityRings} size={180} />
        </TouchableOpacity>

        {/* 歩数カウンター */}
        <View style={styles.section}>
          <StepCounter steps={todayStats.steps} />
        </View>

        {/* 健康データグリッド */}
        <Text style={styles.sectionTitle}>健康データ</Text>
        <View style={styles.cardGrid}>
          <View style={styles.cardWrapper}>
            <HealthCard
              title="消費カロリー"
              value={todayStats.calories}
              unit="kcal"
              color="#FA114F"
              subtitle={`目標: 600 kcal`}
            />
          </View>
          <View style={styles.cardWrapper}>
            <HealthCard
              title="移動距離"
              value={todayStats.distance}
              unit="km"
              color="#5AC8FA"
              subtitle="ウォーキング換算"
            />
          </View>
          <View style={styles.cardWrapper}>
            <HealthCard
              title="心拍数"
              value={heartRateData.current}
              unit="BPM"
              color="#FF3B30"
              subtitle={`安静時: ${heartRateData.resting} BPM`}
            />
          </View>
          <View style={styles.cardWrapper}>
            <HealthCard
              title="睡眠"
              value={`${sleepData.hours}時間${sleepData.minutes}分`}
              color="#5856D6"
              subtitle="昨夜の睡眠"
            />
          </View>
        </View>

        {/* 今日のサマリー */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>今日のサマリー</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>アクティブ時間</Text>
              <Text style={styles.summaryValue}>{todayStats.activeMinutes}分</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>スタンド時間</Text>
              <Text style={styles.summaryValue}>{todayStats.standHours}時間</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>エクササイズ</Text>
              <Text style={styles.summaryValue}>{todayStats.exerciseMinutes}分</Text>
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
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.text.primary,
  },
  date: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
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
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  cardWrapper: {
    width: '50%',
    padding: spacing.xs,
  },
  summarySection: {
    marginTop: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.sm,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
