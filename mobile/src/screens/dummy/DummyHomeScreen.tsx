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
import { useTranslation } from 'react-i18next';
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
import { HeaderMenu } from '../../components/HeaderMenu';
import '../../i18n';

interface DummyHomeScreenProps {
  navigation?: unknown;
}

export const DummyHomeScreen: React.FC<DummyHomeScreenProps> = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'ja' ? 'ja-JP' : 'en-US';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>{t('dummy.goodMorning')}</Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString(locale, {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </Text>
            </View>
            <HeaderMenu />
          </View>
        </View>

        {/* アクティビティリング */}
        <TouchableOpacity style={styles.section} activeOpacity={0.9}>
          <Text style={styles.sectionTitle}>{t('dummy.activity')}</Text>
          <ActivityRing rings={activityRings} size={180} />
        </TouchableOpacity>

        {/* 歩数カウンター */}
        <View style={styles.section}>
          <StepCounter steps={todayStats.steps} />
        </View>

        {/* 健康データグリッド */}
        <Text style={styles.sectionTitle}>{t('dummy.healthData')}</Text>
        <View style={styles.cardGrid}>
          <View style={styles.cardWrapper}>
            <HealthCard
              title={t('dummy.burnedCalories')}
              value={todayStats.calories}
              unit="kcal"
              color="#FA114F"
              subtitle={t('dummy.goal', { value: 600, unit: 'kcal' })}
            />
          </View>
          <View style={styles.cardWrapper}>
            <HealthCard
              title={t('dummy.movementDistance')}
              value={todayStats.distance}
              unit="km"
              color="#5AC8FA"
              subtitle={t('dummy.walkingEquivalent')}
            />
          </View>
          <View style={styles.cardWrapper}>
            <HealthCard
              title={t('dummy.heartRate')}
              value={heartRateData.current}
              unit="BPM"
              color="#FF3B30"
              subtitle={t('dummy.restingHeartRate', { value: heartRateData.resting })}
            />
          </View>
          <View style={styles.cardWrapper}>
            <HealthCard
              title={t('dummy.sleep')}
              value={`${sleepData.hours}${t('dummy.sleepUnit')}${sleepData.minutes}${t('dummy.minutes')}`}
              color="#5856D6"
              subtitle={t('dummy.lastNightSleep')}
            />
          </View>
        </View>

        {/* 今日のサマリー */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>{t('dummy.todaySummary')}</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('dummy.activeTime')}</Text>
              <Text style={styles.summaryValue}>{todayStats.activeMinutes}{t('dummy.minutes')}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('dummy.standTime')}</Text>
              <Text style={styles.summaryValue}>{todayStats.standHours}{t('dummy.hours')}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{t('dummy.exercise')}</Text>
              <Text style={styles.summaryValue}>{todayStats.exerciseMinutes}{t('dummy.minutes')}</Text>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
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
