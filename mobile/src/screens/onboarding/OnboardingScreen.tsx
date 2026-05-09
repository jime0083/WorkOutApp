/**
 * OnboardingScreen - オンボーディング画面
 * 初回起動時に4枚のスライドを表示
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';
import { useOnboardingStore } from '../../stores/onboardingStore';
import '../../i18n';

const { width } = Dimensions.get('window');

interface SlideData {
  id: string;
  icon: string;
  titleKey: string;
  descriptionKey: string;
}

const slides: SlideData[] = [
  {
    id: '1',
    icon: '🔒',
    titleKey: 'onboarding.slide1Title',
    descriptionKey: 'onboarding.slide1Description',
  },
  {
    id: '2',
    icon: '🔑',
    titleKey: 'onboarding.slide2Title',
    descriptionKey: 'onboarding.slide2Description',
  },
  {
    id: '3',
    icon: '👤',
    titleKey: 'onboarding.slide3Title',
    descriptionKey: 'onboarding.slide3Description',
  },
  {
    id: '4',
    icon: '💬',
    titleKey: 'onboarding.slide4Title',
    descriptionKey: 'onboarding.slide4Description',
  },
];

export const OnboardingScreen: React.FC = () => {
  const { t } = useTranslation();
  const { completeOnboarding } = useOnboardingStore();
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
      completeOnboarding();
    }
  }, [currentIndex, completeOnboarding]);

  const handleSkip = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const renderSlide = ({ item }: { item: SlideData }) => (
    <View style={styles.slide}>
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.title}>{t(item.titleKey)}</Text>
      <Text style={styles.description}>{t(item.descriptionKey)}</Text>
    </View>
  );

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
          outputRange: [8, 16, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
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

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {isLastSlide ? t('common.done') : t('common.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  skipButton: {
    padding: spacing.sm,
  },
  skipText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  nextText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.white,
  },
});

export default OnboardingScreen;
