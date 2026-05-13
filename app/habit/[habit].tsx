import { useCallback, useEffect, useState } from 'react';

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { usePostHog } from 'posthog-react-native';

import CovenantBackdrop from '../../components/CovenantBackdrop';
import { getTodayHabitEntry } from '../../utils/habitEngine';
import { getLanguage, Language } from '../../utils/language';
import { completeHabit, getHabitProgress } from '../../utils/progress';

const HABIT_INFO = {
  es: {
    coldShower: { title: 'DUCHA FRÍA' },
    exercise: { title: 'EJERCICIO' },
    meditation: { title: 'MEDITACIÓN' },
    silence: { title: 'SILENCIO' },
    writing: { title: 'ESCRITURA' },
    gratitude: { title: 'GRATITUD' },
    noVices: { title: 'SIN VICIOS' },
    dominateMind: { title: 'DOMINAR MENTE' },
    mentalStrength: { title: 'FORTALEZA MENTAL' },
    discipline: { title: 'DISCIPLINA' },
  },
  en: {
    coldShower: { title: 'COLD SHOWER' },
    exercise: { title: 'EXERCISE' },
    meditation: { title: 'MEDITATION' },
    silence: { title: 'SILENCE' },
    writing: { title: 'WRITING' },
    gratitude: { title: 'GRATITUDE' },
    noVices: { title: 'NO ADDICTIONS' },
    dominateMind: { title: 'MASTER THE MIND' },
    mentalStrength: { title: 'MENTAL STRENGTH' },
    discipline: { title: 'DISCIPLINE' },
  },
};

export default function HabitScreen() {
  const { habit } = useLocalSearchParams();
  const posthog = usePostHog();

  const [language, setLanguage] = useState<Language>('es');
  const [completedDays, setCompletedDays] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const glow = useSharedValue(0.015);
  const screenOpacity = useSharedValue(0);
  const screenScale = useSharedValue(0.985);
  const headerShift = useSharedValue(16);
  const heroShift = useSharedValue(22);
  const verseShift = useSharedValue(26);
  const progressWidth = useSharedValue(0);
  const progressScale = useSharedValue(1);
  const completeScale = useSharedValue(1);
  const deeperScale = useSharedValue(1);

  const currentHour = new Date().getHours();
  const isNight = currentHour >= 19 || currentHour <= 5;

  const loadLanguage = useCallback(async () => {
    const currentLanguage = await getLanguage();
    setLanguage(currentLanguage);
  }, []);

  const loadProgress = useCallback(async () => {
    const progress = await getHabitProgress(String(habit));

    setCompletedDays(progress.completedDays);
    setStreak(progress.streak);

    const today = new Date().toISOString().split('T')[0];

    setCompletedToday(progress.lastCompleted === today);
  }, [habit]);

  useEffect(() => {
    loadLanguage();
    loadProgress();
  }, [loadLanguage, loadProgress]);

  useEffect(() => {
    screenOpacity.value = withTiming(1, {
      duration: 680,
      easing: Easing.out(Easing.cubic),
    });
    screenScale.value = withTiming(1, {
      duration: 760,
      easing: Easing.out(Easing.cubic),
    });
    headerShift.value = withTiming(0, {
      duration: 620,
      easing: Easing.out(Easing.cubic),
    });
    heroShift.value = withDelay(
      110,
      withTiming(0, {
        duration: 720,
        easing: Easing.out(Easing.cubic),
      })
    );
    verseShift.value = withDelay(
      220,
      withTiming(0, {
        duration: 720,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [headerShift, heroShift, screenOpacity, screenScale, verseShift]);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(isNight ? 0.03 : 0.055, {
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(isNight ? 0.01 : 0.018, {
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, [glow, isNight]);

  useEffect(() => {
    const targetProgress = Math.min((completedDays / 30) * 100, 100);

    progressWidth.value = withTiming(targetProgress, {
      duration: 850,
      easing: Easing.out(Easing.cubic),
    });
    progressScale.value = withSequence(
      withSpring(1.018, {
        damping: 16,
        stiffness: 130,
      }),
      withSpring(1, {
        damping: 18,
        stiffness: 120,
      })
    );
  }, [completedDays, progressScale, progressWidth]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ scale: screenScale.value }],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ translateY: headerShift.value }],
  }));

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ translateY: heroShift.value }],
  }));

  const verseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ translateY: verseShift.value }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const progressCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progressScale.value }],
  }));

  const completeButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: completeScale.value }],
  }));

  const deeperButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: deeperScale.value }],
  }));

  const currentDay = completedDays + 1;
  const covenantPercent = Math.min(Math.round((completedDays / 30) * 100), 100);
  const entries = getTodayHabitEntry(String(habit), currentDay);
  const current = isNight ? entries.night : entries.morning;

  if (!current) {
    return null;
  }

  const info =
    language === 'es'
      ? HABIT_INFO.es[habit as keyof typeof HABIT_INFO.es]
      : HABIT_INFO.en[habit as keyof typeof HABIT_INFO.en];

  const t =
    language === 'es'
      ? {
          path: 'RITUAL DIARIO',
          streak: 'PACTO VIVO',
          phrase: 'FRASE',
          verse: 'VERSO',
          progress: 'AVANCE REAL',
          streakMeta: `${streak} días en racha`,
          dayMeta: `DÍA ${currentDay} DE 30`,
          supportTitle: 'SOSTENER COVENANT',
          supportText:
            'Tu suscripción ayuda a crear más lecturas, mejorar la experiencia y sostener una herramienta hecha para vivir con más honestidad.',
          night: 'NOCHE',
          morning: 'MAÑANA',
          reflection: 'REFLEXIÓN',
          completed: 'SESIÓN COMPLETADA',
          saving: 'GUARDANDO PROGRESO',
          complete: '¿FUISTE HONESTO CONTIGO HOY?',
          deeper: 'ENTRAR EN PROFUNDIDAD',
          alreadyTitle: 'Ya completado',
          alreadyText: 'Ya fuiste honesto contigo hoy.',
          successTitle: 'Sesión completada',
          successText: 'Hoy fuiste honesto contigo.',
          locale: 'es-MX',
        }
      : {
          path: 'DAILY RITUAL',
          streak: 'LIVING VOW',
          phrase: 'PHRASE',
          verse: 'SCRIPTURE',
          progress: 'REAL PROGRESS',
          streakMeta: `${streak} day streak`,
          dayMeta: `DAY ${currentDay} OF 30`,
          supportTitle: 'SUSTAIN COVENANT',
          supportText:
            'Your subscription helps create more readings, improve the experience, and sustain a tool built for a more honest life.',
          night: 'NIGHT',
          morning: 'MORNING',
          reflection: 'REFLECTION',
          completed: 'SESSION COMPLETED',
          saving: 'SAVING PROGRESS',
          complete: 'WERE YOU HONEST WITH YOURSELF TODAY?',
          deeper: 'ENTER DEEPER',
          alreadyTitle: 'Already completed',
          alreadyText: 'You were already honest with yourself today.',
          successTitle: 'Session completed',
          successText: 'Today you were honest with yourself.',
          locale: 'en-US',
        };

  const today = new Date();
  const formattedDate = today.toLocaleDateString(t.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handleComplete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (completedToday) {
      Alert.alert(t.alreadyTitle, t.alreadyText);
      return;
    }

    setIsCompleting(true);

    try {
      const updated = await completeHabit(String(habit));

      setCompletedDays(updated.completedDays);
      setStreak(updated.streak);
      setCompletedToday(true);

      posthog.capture('habit_completed', {
        habit_slug: String(habit),
        completed_days: updated.completedDays,
        streak: updated.streak,
        period: isNight ? 'night' : 'morning',
        language,
      });

      Alert.alert(t.successTitle, t.successText);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCompletePressIn = () => {
    completeScale.value = withSpring(0.975, {
      damping: 18,
      stiffness: 220,
    });
  };

  const handleCompletePressOut = () => {
    completeScale.value = withSpring(1, {
      damping: 16,
      stiffness: 180,
    });
  };

  const handleDeeperPressIn = () => {
    deeperScale.value = withSpring(0.98, {
      damping: 18,
      stiffness: 210,
    });
  };

  const handleDeeperPressOut = () => {
    deeperScale.value = withSpring(1, {
      damping: 16,
      stiffness: 180,
    });
  };

  const navigateDeeper = async () => {
    await Haptics.selectionAsync();

    posthog.capture('deeper_entered', {
      habit_slug: String(habit),
      day: currentDay,
      period: current.period,
      language,
    });

    router.push({
      pathname: '/deeper',
      params: {
        habit: String(habit),
        day: String(currentDay),
        period: current.period,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backdrop}>
        <CovenantBackdrop intensity="subtle" variant="habit" />
        <Animated.View
          style={[
            styles.backgroundGlow,
            glowStyle,
            {
              backgroundColor: isNight ? '#6B4A2A' : '#C47A32',
            },
          ]}
        />
        <View style={styles.topVignette} />
        <View style={styles.bottomVignette} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, screenStyle]}>
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <View style={styles.headerCopy}>
              <Text style={[styles.date, isNight && styles.nightDate]}>
                {formattedDate}
              </Text>

              <Text style={styles.day}>
                {t.path} • {isNight ? t.night : t.morning}
              </Text>
            </View>

            <BlurView intensity={18} tint="dark" style={styles.streakShell}>
              <Text style={styles.streakLabel}>{t.streak}</Text>
              <Text style={[styles.streak, isNight && styles.nightAccent]}>
                {covenantPercent}%
              </Text>

              <Text style={styles.streakMeta}>{t.streakMeta}</Text>
            </BlurView>
          </Animated.View>

          <Animated.View style={[styles.progressCard, progressCardStyle]}>
            <BlurView intensity={24} tint="dark" style={styles.progressBlur}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{t.progress}</Text>
                <Text style={styles.progressValue}>{t.dayMeta}</Text>
              </View>

              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressBar, progressBarStyle]}>
                  <View style={styles.progressGlow} />
                </Animated.View>
              </View>

              <Text style={styles.progressCaption}>
                {completedToday ? t.completed : t.complete}
              </Text>
            </BlurView>
          </Animated.View>

          <Animated.View style={[styles.hero, heroAnimatedStyle]}>
            <Text style={[styles.period, isNight && styles.nightPeriod]}>
              {isNight ? t.night : t.morning}
            </Text>

            <Text style={[styles.title, isNight && styles.nightTitle]}>
              {info.title}
            </Text>

            <Text style={styles.contentLabel}>{t.phrase}</Text>

            <Text style={[styles.quote, isNight && styles.nightQuote]}>
              {'"'}{current.quote}{'"'}
            </Text>

            <Text style={styles.author}>— {current.quoteAuthor}</Text>

            <View style={styles.scriptureBlock}>
              <View style={styles.verseLine} />

              <Text style={styles.verseLabel}>{t.verse}</Text>

              <Text style={[styles.verse, isNight && styles.nightVerse]}>
                {'"'}{current.verse}{'"'}
              </Text>

              <Text style={styles.reference}>{current.reference}</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.reflectionSection, verseAnimatedStyle]}>
            <Text style={styles.reflectionLabel}>{t.reflection}</Text>

            <Text style={[styles.reflection, isNight && styles.nightReflection]}>
              {current.reflection}
            </Text>
          </Animated.View>

          <View style={styles.footer}>
            <Pressable
              disabled={isCompleting}
              onPress={handleComplete}
              onPressIn={handleCompletePressIn}
              onPressOut={handleCompletePressOut}
            >
              <Animated.View
                style={[
                  styles.completeButton,
                  completeButtonStyle,
                  completedToday && styles.completedButton,
                  isNight && styles.nightButton,
                ]}
              >
                <View style={styles.buttonAura} />
                {isCompleting ? (
                  <ActivityIndicator color="#D8A060" />
                ) : (
                  <Text
                    style={[
                      styles.completeText,
                      completedToday && styles.completedText,
                      isNight && styles.nightAccentText,
                    ]}
                  >
                    {completedToday ? t.completed : t.complete}
                  </Text>
                )}
              </Animated.View>
            </Pressable>

            <Pressable
              onPress={navigateDeeper}
              onPressIn={handleDeeperPressIn}
              onPressOut={handleDeeperPressOut}
            >
              <Animated.View style={[styles.deeperButton, deeperButtonStyle]}>
                <BlurView intensity={16} tint="dark" style={styles.deeperBlur}>
                  <Text style={styles.deeperText}>{t.deeper}</Text>
                </BlurView>
              </Animated.View>
            </Pressable>

            <View style={styles.supportCard}>
              <Text style={styles.supportTitle}>{t.supportTitle}</Text>
              <Text style={styles.supportText}>{t.supportText}</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030303',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },

  scroll: {
    paddingBottom: 120,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 70,
  },

  backgroundGlow: {
    position: 'absolute',
    top: 86,
    alignSelf: 'center',
    width: 340,
    height: 340,
    borderRadius: 170,
    shadowColor: '#D88C3A',
    shadowOpacity: 0.32,
    shadowRadius: 80,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 230,
    backgroundColor: 'rgba(255,255,255,0.018)',
  },

  bottomVignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 360,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },

  headerCopy: {
    flex: 1,
    paddingRight: 18,
  },

  date: {
    color: '#F4F0EB',
    fontSize: 16,
    textTransform: 'capitalize',
    marginBottom: 12,
    fontWeight: '400',
  },

  nightDate: {
    color: '#B8B8B8',
  },

  day: {
    color: '#74706B',
    fontSize: 11,
    letterSpacing: 4,
  },

  streakShell: {
    minWidth: 112,
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.14)',
    borderRadius: 22,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(8,8,8,0.42)',
  },

  streakLabel: {
    color: '#68615B',
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 7,
  },

  streak: {
    color: '#D88C3A',
    fontSize: 29,
    fontWeight: '300',
  },

  streakMeta: {
    color: '#625C56',
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 5,
  },

  nightAccent: {
    color: '#A87442',
  },

  progressCard: {
    marginBottom: 74,
    borderRadius: 28,
    shadowColor: '#D88C3A',
    shadowOpacity: 0.13,
    shadowRadius: 34,
    shadowOffset: {
      width: 0,
      height: 18,
    },
  },

  progressBlur: {
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.13)',
    backgroundColor: 'rgba(7,7,7,0.64)',
    padding: 22,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  progressLabel: {
    color: '#746A62',
    fontSize: 10,
    letterSpacing: 5,
  },

  progressValue: {
    color: '#D6B086',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
  },

  progressTrack: {
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 16,
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#C77B32',
    borderRadius: 999,
    overflow: 'hidden',
  },

  progressGlow: {
    flex: 1,
    backgroundColor: 'rgba(255,232,200,0.22)',
  },

  progressCaption: {
    color: '#827A72',
    fontSize: 11,
    letterSpacing: 2,
    lineHeight: 18,
  },

  hero: {
    marginBottom: 70,
  },

  period: {
    color: '#756C63',
    fontSize: 11,
    letterSpacing: 6,
    marginBottom: 26,
  },

  nightPeriod: {
    color: '#6C6762',
  },

  title: {
    color: '#FFF9F2',
    fontSize: 50,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 48,
  },

  nightTitle: {
    color: '#E8E8E8',
  },

  contentLabel: {
    color: '#8A7460',
    fontSize: 10,
    letterSpacing: 6,
    marginBottom: 22,
  },

  quote: {
    color: '#F8F1EA',
    fontSize: 38,
    lineHeight: 60,
    fontWeight: '300',
  },

  nightQuote: {
    color: '#D8D8D8',
  },

  author: {
    color: '#746C65',
    marginTop: 28,
    fontSize: 15,
    letterSpacing: 1,
  },

  scriptureBlock: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.13)',
    borderRadius: 30,
    backgroundColor: 'rgba(8,8,8,0.68)',
    padding: 26,
    marginTop: 44,
  },

  verseLine: {
    width: 42,
    height: 1,
    backgroundColor: 'rgba(216,140,58,0.44)',
    marginBottom: 26,
  },

  verseLabel: {
    color: '#A87442',
    fontSize: 10,
    letterSpacing: 6,
    marginBottom: 22,
  },

  verse: {
    color: '#E7E0D8',
    fontSize: 29,
    lineHeight: 48,
    fontStyle: 'italic',
    fontWeight: '300',
  },

  nightVerse: {
    color: '#CFCFCF',
  },

  reference: {
    color: '#81776E',
    marginTop: 22,
    fontSize: 15,
    letterSpacing: 1,
  },

  reflectionSection: {
    marginBottom: 92,
  },

  reflectionLabel: {
    color: '#766D63',
    fontSize: 10,
    letterSpacing: 6,
    marginBottom: 24,
  },

  reflection: {
    color: '#A69C92',
    fontSize: 32,
    lineHeight: 52,
    fontWeight: '300',
  },

  nightReflection: {
    color: '#838383',
  },

  footer: {
    marginBottom: 70,
  },

  completeButton: {
    minHeight: 76,
    backgroundColor: '#11100F',
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.22)',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#D88C3A',
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: {
      width: 0,
      height: 16,
    },
  },

  completedButton: {
    backgroundColor: '#131313',
    borderColor: 'rgba(255,255,255,0.12)',
    shadowOpacity: 0.08,
  },

  nightButton: {
    backgroundColor: '#090909',
    borderColor: 'rgba(168,116,66,0.22)',
  },

  buttonAura: {
    position: 'absolute',
    top: -42,
    width: 180,
    height: 72,
    borderRadius: 90,
    backgroundColor: 'rgba(216,140,58,0.12)',
  },

  completeText: {
    color: '#D8A060',
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },

  completedText: {
    color: '#8E8984',
  },

  nightAccentText: {
    color: '#A87442',
  },

  deeperButton: {
    borderRadius: 26,
    shadowColor: '#000',
    shadowOpacity: 0.42,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 16,
    },
  },

  deeperBlur: {
    minHeight: 74,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 26,
    backgroundColor: 'rgba(8,8,8,0.58)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deeperText: {
    color: '#F3EEE8',
    fontSize: 12,
    letterSpacing: 5,
    fontWeight: '600',
  },

  supportCard: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.11)',
    borderRadius: 24,
    backgroundColor: 'rgba(7,7,7,0.48)',
    paddingHorizontal: 22,
    paddingVertical: 24,
  },

  supportTitle: {
    color: '#A87442',
    fontSize: 10,
    letterSpacing: 5,
    marginBottom: 14,
  },

  supportText: {
    color: '#8F867E',
    fontSize: 15,
    lineHeight: 25,
    fontWeight: '300',
  },
});
