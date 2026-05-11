/**
 * DummyHomeScreen - ダミーホーム画面
 * Apple Health風のフィットネスダッシュボード
 * Design: Wellness Serenity
 */
import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
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
  const insets = useSafeAreaInsets();
  const locale = i18n.language === 'ja' ? 'ja-JP' : 'en-US';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
        ]}
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
        <TouchableOpacity style={styles.activityCard} activeOpacity={0.9}>
          <Text style={styles.cardTitle}>{t('dummy.activity')}</Text>
          <View style={styles.activityContent}>
            <ActivityRing rings={activityRings} size={180} />
          </View>
        </TouchableOpacity>

        {/* 歩数カウンター */}
        <View style={styles.stepCard}>
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
              color={colors.primary}
              subtitle={t('dummy.walkingEquivalent')}
            />
          </View>
          <View style={styles.cardWrapper}>
            <HealthCard
              title={t('dummy.heartRate')}
              value={heartRateData.current}
              unit="BPM"
              color="#EF4444"
              subtitle={t('dummy.restingHeartRate', { value: heartRateData.resting })}
            />
          </View>
          <View style={styles.cardWrapper}>
            <HealthCard
              title={t('dummy.sleep')}
              value={`${sleepData.hours}${t('dummy.sleepUnit')}${sleepData.minutes}${t('dummy.minutes')}`}
              color="#6366F1"
              subtitle={t('dummy.lastNightSleep')}
            />
          </View>
        </View>

        {/* 今日のサマリー */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>{t('dummy.todaySummary')}</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIconContainer, { backgroundColor: colors.primaryMuted }]}>
                <Text style={styles.summaryIcon}>⏱️</Text>
              </View>
              <Text style={styles.summaryLabel}>{t('dummy.activeTime')}</Text>
              <Text style={styles.summaryValue}>{todayStats.activeMinutes}{t('dummy.minutes')}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIconContainer, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.summaryIcon}>🧍</Text>
              </View>
              <Text style={styles.summaryLabel}>{t('dummy.standTime')}</Text>
              <Text style={styles.summaryValue}>{todayStats.standHours}{t('dummy.hours')}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Text style={styles.summaryIcon}>🏃</Text>
              </View>
              <Text style={styles.summaryLabel}>{t('dummy.exercise')}</Text>
              <Text style={styles.summaryValue}>{todayStats.exerciseMinutes}{t('dummy.minutes')}</Text>
            </View>
          </View>
        </View>

        {/* スペーサー */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
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
    paddingHorizontal: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
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
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  activityContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCard: {
    marginBottom: spacing.xl,
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
    marginTop: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    flexDirection: 'row',
    ...shadows.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  summaryIcon: {
    fontSize: 20,
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as '700',
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
