/**
 * FeatureExplanationScreen - 仕様説明オンボーディング画面
 * アカウント作成前にアプリの仕組みを説明する5枚のスライド
 * Design: Wellness Serenity
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';
import '../../i18n';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

interface SlideData {
  id: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
  backgroundColor: string;
  accentColor: string;
}

const slides: SlideData[] = [
  {
    id: '1',
    icon: '🔐',
    titleKey: 'featureExplanation.slide1Title',
    descriptionKey: 'featureExplanation.slide1Description',
    backgroundColor: '#F0FDFA',
    accentColor: colors.primary,
  },
  {
    id: '2',
    icon: '🔑',
    titleKey: 'featureExplanation.slide2Title',
    descriptionKey: 'featureExplanation.slide2Description',
    backgroundColor: '#FEF3C7',
    accentColor: '#F59E0B',
  },
  {
    id: '3',
    icon: '💬',
    titleKey: 'featureExplanation.slide3Title',
    descriptionKey: 'featureExplanation.slide3Description',
    backgroundColor: '#DBEAFE',
    accentColor: '#3B82F6',
  },
  {
    id: '4',
    icon: '🎭',
    titleKey: 'featureExplanation.slide4Title',
    descriptionKey: 'featureExplanation.slide4Description',
    backgroundColor: '#F3E8FF',
    accentColor: '#A855F7',
  },
  {
    id: '5',
    icon: '🗑️',
    titleKey: 'featureExplanation.slide5Title',
    descriptionKey: 'featureExplanation.slide5Description',
    backgroundColor: '#FEE2E2',
    accentColor: '#EF4444',
  },
];

export const FeatureExplanationScreen: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.navigate('Register');
    }
  }, [currentIndex, navigation]);

  const handleSkip = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  const renderSlide = ({ item, index }: { item: SlideData; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale }], opacity }]}>
          <View style={[styles.iconBackground, { backgroundColor: item.backgroundColor }]}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>
          <View style={[styles.stepBadge, { backgroundColor: item.accentColor }]}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
          </View>
        </Animated.View>
        <Animated.View style={{ opacity }}>
          <Text style={styles.title}>{t(item.titleKey)}</Text>
          <Text style={styles.description}>{t(item.descriptionKey)}</Text>
        </Animated.View>
      </View>
    );
  };

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 28, 8],
          extrapolate: 'clamp',
        });

        const backgroundColor = scrollX.interpolate({
          inputRange,
          outputRange: [colors.gray300, colors.primary, colors.gray300],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                backgroundColor,
              },
            ]}
          />
        );
      })}
    </View>
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems[0]?.index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{t('featureExplanation.title')}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / slides.length) * 100}%` },
              ]}
            />
          </View>
        </View>
        {!isLastSlide && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>{t('common.next')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {renderDots()}

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextText}>
            {isLastSlide ? t('featureExplanation.getStarted') : t('common.next')}
          </Text>
        </TouchableOpacity>

        {isLastSlide && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
          >
            <Text style={styles.loginLinkText}>
              {t('auth.hasAccount')}
              <Text style={styles.loginLinkTextBold}> {t('auth.login')}</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as '500',
    color: colors.text.secondary,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  iconContainer: {
    marginBottom: spacing['3xl'],
    position: 'relative',
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  stepBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  stepNumber: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold as '700',
    color: colors.white,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular as '400',
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  dot: {
    height: 8,
    borderRadius: borderRadius.full,
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: spacing.xl,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  nextText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.white,
    letterSpacing: 0.5,
  },
  loginLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  loginLinkTextBold: {
    color: colors.primary,
    fontWeight: typography.weights.semibold as '600',
  },
});

export default FeatureExplanationScreen;
