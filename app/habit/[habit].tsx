import { useCallback, useEffect, useState } from 'react';

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';

import {
  ActivityIndicator,
  Alert,
  AccessibilityInfo,
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
import { useSubscription } from '../../context/SubscriptionContext';
import { TarotVisualSymbol } from '../../data/oracle';
import { useAuthStore } from '../../store/authStore';
import { getTodayHabitEntry } from '../../utils/habitEngine';
import { getLocalDateKey } from '../../utils/dates';
import { getLanguage, Language } from '../../utils/language';
import {
  getDailyNumberDraw,
  getDailyTarotDraw,
  getHabitTarotReflection,
  getOracleUserKey,
  OracleNumberDraw,
  OracleTarotDraw,
  revealDailyNumberDraw,
  revealDailyTarotDraw,
} from '../../utils/oracle';
import { completeHabit, getHabitProgress } from '../../utils/progress';

const CELEBRATION_PARTICLES = [
  { x: -126, y: -188, size: 5, color: 'rgba(255,209,160,0.92)', delay: 0 },
  { x: -96, y: -232, size: 3, color: 'rgba(216,140,58,0.86)', delay: 35 },
  { x: -68, y: -166, size: 4, color: 'rgba(168,116,66,0.84)', delay: 70 },
  { x: -36, y: -252, size: 5, color: 'rgba(245,197,126,0.88)', delay: 20 },
  { x: 0, y: -206, size: 3, color: 'rgba(255,238,210,0.82)', delay: 95 },
  { x: 34, y: -244, size: 4, color: 'rgba(216,140,58,0.9)', delay: 50 },
  { x: 72, y: -178, size: 5, color: 'rgba(180,112,52,0.86)', delay: 85 },
  { x: 104, y: -222, size: 3, color: 'rgba(255,209,160,0.86)', delay: 30 },
  { x: 132, y: -162, size: 4, color: 'rgba(196,122,50,0.82)', delay: 115 },
  { x: -146, y: -112, size: 2, color: 'rgba(255,232,200,0.7)', delay: 130 },
  { x: 148, y: -118, size: 2, color: 'rgba(255,232,200,0.7)', delay: 150 },
  { x: 0, y: -286, size: 2, color: 'rgba(216,140,58,0.72)', delay: 160 },
];

type CelebrationParticle = (typeof CELEBRATION_PARTICLES)[number];

function PremiumCelebrationParticle({
  burstKey,
  particle,
}: {
  burstKey: number;
  particle: CelebrationParticle;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (burstKey === 0) {
      progress.value = 0;
      return;
    }

    progress.value = 0;
    progress.value = withDelay(
      particle.delay,
      withTiming(1, {
        duration: 860,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [burstKey, particle.delay, progress]);

  const particleStyle = useAnimatedStyle(() => ({
    opacity:
      progress.value < 0.12
        ? progress.value / 0.12
        : Math.max(0, 1 - progress.value),
    transform: [
      { translateX: progress.value * particle.x },
      { translateY: progress.value * particle.y },
      {
        scale:
          progress.value < 0.18
            ? 0.75 + progress.value * 2.1
            : Math.max(0.35, 1.08 - progress.value * 0.42),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.celebrationParticle,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
        },
        particleStyle,
      ]}
    />
  );
}

function PremiumCelebration({ burstKey }: { burstKey: number }) {
  return (
    <View pointerEvents="none" style={styles.celebrationOverlay}>
      <View style={styles.celebrationOrigin}>
        {CELEBRATION_PARTICLES.map((particle, index) => (
          <PremiumCelebrationParticle
            burstKey={burstKey}
            key={`${index}-${particle.x}-${particle.y}`}
            particle={particle}
          />
        ))}
      </View>
    </View>
  );
}

function SealOfDayIcon({
  active,
  number,
}: {
  active: boolean;
  number?: number;
}) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.035, {
            duration: 1150,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: 1150,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
      return;
    }

    pulse.value = withTiming(1, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, pulse]);

  const sealStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={[styles.daySeal, sealStyle]}>
      <View style={styles.daySealGlow} />
      <View style={styles.daySealOuter} />
      <View style={styles.daySealInner} />
      <View style={styles.daySealMarkTop} />
      <View style={styles.daySealMarkBottom} />
      <Text style={styles.daySealNumber}>{number ?? '—'}</Text>
    </Animated.View>
  );
}

function MiniTarotOracleCard({
  active,
  card,
  language,
  locked = false,
}: {
  active: boolean;
  card?: OracleTarotDraw | null;
  language: Language;
  locked?: boolean;
}) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.025, {
            duration: 980,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: 980,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
      return;
    }

    pulse.value = withTiming(1, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, pulse]);

  const miniCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.miniTarotCard,
        locked && styles.miniTarotCardLocked,
        miniCardStyle,
      ]}
    >
      <View style={styles.miniTarotEdgeGlow} />
      <View style={styles.miniTarotTopMark} />
      <Text style={styles.miniTarotName} numberOfLines={2}>
        {card ? localize(card.name, language) : locked ? 'PRO' : 'CARD'}
      </Text>
      <View style={styles.miniTarotCenterLine} />
      <View style={styles.miniTarotBottomMark} />
    </Animated.View>
  );
}

function CompleteSealIcon({ completed }: { completed: boolean }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (completed) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, {
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
      return;
    }

    pulse.value = withTiming(1, {
      duration: 360,
      easing: Easing.out(Easing.cubic),
    });
  }, [completed, pulse]);

  const sealPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.completeSealIcon,
        completed && styles.completeSealWon,
        sealPulseStyle,
      ]}
    >
      <View style={styles.completeSealRing} />
      <View style={styles.completeSealFlare} />
      <View style={styles.completeSealCore} />
    </Animated.View>
  );
}

function DeeperDivineIcon() {
  return (
    <View style={styles.deeperDivineIcon}>
      <View style={styles.deeperPortalRing} />
      <View style={styles.deeperPortalLine} />
      <View style={[styles.deeperPortalLine, styles.deeperPortalLineTurn]} />
      <View style={styles.deeperDoorway} />
    </View>
  );
}

function localize(
  value: {
    en: string;
    es: string;
  },
  language: Language
) {
  return language === 'es' ? value.es : value.en;
}

function TarotSigil({ symbol }: { symbol: TarotVisualSymbol }) {
  return (
    <View style={styles.tarotSigil}>
      <View style={styles.tarotSigilOuterRing} />
      <View style={styles.tarotSigilInnerRing} />
      <View
        style={[
          styles.tarotSigilAxis,
          (symbol === 'scales' || symbol === 'chariot') &&
            styles.tarotSigilAxisWide,
        ]}
      />
      <View
        style={[
          styles.tarotSigilAxis,
          styles.tarotSigilAxisVertical,
          (symbol === 'pillar' || symbol === 'tower') &&
            styles.tarotSigilAxisStrong,
        ]}
      />
      {(symbol === 'moon' || symbol === 'veil' || symbol === 'threshold') && (
        <View style={styles.tarotCrescent} />
      )}
      {(symbol === 'sun' || symbol === 'star' || symbol === 'world') && (
        <View style={styles.tarotRadiance}>
          <View style={styles.tarotRay} />
          <View style={[styles.tarotRay, styles.tarotRayTilt]} />
          <View style={[styles.tarotRay, styles.tarotRayCross]} />
        </View>
      )}
      {(symbol === 'chain' || symbol === 'wheel') && (
        <View style={styles.tarotDoubleOrbit}>
          <View style={styles.tarotOrbitDot} />
          <View style={[styles.tarotOrbitDot, styles.tarotOrbitDotOpposite]} />
        </View>
      )}
      <View
        style={[
          styles.tarotSigilCore,
          (symbol === 'tower' || symbol === 'throne') &&
            styles.tarotSigilCoreSquare,
        ]}
      />
    </View>
  );
}

function CovenantTarotCard({
  card,
  language,
}: {
  card: OracleTarotDraw;
  language: Language;
}) {
  return (
    <View style={styles.tarotArtwork}>
      <View style={styles.tarotArtworkFrame}>
        <View style={styles.tarotCornerTopLeft} />
        <View style={styles.tarotCornerTopRight} />
        <View style={styles.tarotCornerBottomLeft} />
        <View style={styles.tarotCornerBottomRight} />

        <Text style={styles.tarotArtworkRoman}>{card.romanNumeral}</Text>
        <View style={styles.tarotArtworkLine} />
        <TarotSigil symbol={card.visualSymbol} />
        <View style={styles.tarotStarRow}>
          <View style={styles.tarotStarDot} />
          <View style={styles.tarotStarLine} />
          <View style={styles.tarotStarDot} />
        </View>
        <Text style={styles.tarotArtworkName}>
          {localize(card.name, language)}
        </Text>
      </View>
    </View>
  );
}

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
  const habitSlug = String(habit);
  const posthog = usePostHog();
  const { isPro } = useSubscription();
  const user = useAuthStore((state) => state.user);

  const [language, setLanguage] = useState<Language>('es');
  const [completedDays, setCompletedDays] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);
  const [numberDraw, setNumberDraw] = useState<OracleNumberDraw | null>(null);
  const [tarotDraw, setTarotDraw] = useState<OracleTarotDraw | null>(null);
  const [isRevealingNumber, setIsRevealingNumber] = useState(false);
  const [isRevealingTarot, setIsRevealingTarot] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

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
    const progress = await getHabitProgress(habitSlug);

    setCompletedDays(progress.completedDays);
    setStreak(progress.streak);

    const today = getLocalDateKey();

    setCompletedToday(progress.lastCompleted === today);
  }, [habitSlug]);

  const userStorageKey = user ? String(user.id || user.email) : null;

  const loadOracle = useCallback(async () => {
    const oracleUserKey = await getOracleUserKey(userStorageKey);

    const [dailyNumber, dailyTarot] = await Promise.all([
      getDailyNumberDraw(oracleUserKey),
      getDailyTarotDraw(oracleUserKey),
    ]);

    setNumberDraw(dailyNumber);
    setTarotDraw(dailyTarot);
  }, [userStorageKey]);

  useEffect(() => {
    loadLanguage();
    loadProgress();
    loadOracle();
  }, [loadLanguage, loadOracle, loadProgress]);

  useEffect(() => {
    let active = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) {
          setReduceMotionEnabled(enabled);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

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
        withTiming(isNight ? 0.04 : 0.068, {
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(isNight ? 0.014 : 0.024, {
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
  const entries = getTodayHabitEntry(habitSlug, currentDay);
  const current = isNight ? entries.night : entries.morning;

  if (!current) {
    return null;
  }

  const info =
    language === 'es'
      ? HABIT_INFO.es[habitSlug as keyof typeof HABIT_INFO.es]
      : HABIT_INFO.en[habitSlug as keyof typeof HABIT_INFO.en];

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
          oracleTitle: 'ORÁCULO DIARIO',
          oracleText: 'Revela el símbolo asignado a la disciplina de hoy.',
          numberTitle: 'Número del día',
          tarotTitle: 'Carta del día',
          revealNumber: 'Revelar número',
          drawCard: 'Sacar carta',
          todayNumber: 'Número de hoy',
          todayCard: 'Carta de hoy',
          reflectionQuestion: 'PREGUNTA',
          proBadge: 'PRO',
          tarotLocked: 'El tarot diario es un ritual Covenant Pro.',
          oracleUnavailableTitle: 'Oráculo no disponible',
          oracleUnavailableText:
            'Inicia sesión nuevamente para revelar el símbolo diario.',
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
          oracleTitle: 'DAILY ORACLE',
          oracleText: 'Reveal the symbol assigned to today’s discipline.',
          numberTitle: 'Number of the Day',
          tarotTitle: 'Card of the Day',
          revealNumber: 'Reveal Number',
          drawCard: 'Draw Card',
          todayNumber: 'Today’s Number',
          todayCard: 'Today’s Card',
          reflectionQuestion: 'QUESTION',
          proBadge: 'PRO',
          tarotLocked: 'Daily tarot is a Covenant Pro ritual.',
          oracleUnavailableTitle: 'Oracle unavailable',
          oracleUnavailableText:
            'Sign in again to reveal the daily symbol.',
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
      const updated = await completeHabit(habitSlug);

      setCompletedDays(updated.completedDays);
      setStreak(updated.streak);
      setCompletedToday(true);

      if (!reduceMotionEnabled) {
        setCelebrationKey((currentKey) => currentKey + 1);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined
      );

      posthog.capture('habit_completed', {
        habit_slug: habitSlug,
        completed_days: updated.completedDays,
        streak: updated.streak,
        period: isNight ? 'night' : 'morning',
        language,
      });

    } finally {
      setIsCompleting(false);
    }
  };

  const waitForOracleReveal = async () => {
    if (reduceMotionEnabled) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1250));
  };

  const handleRevealNumber = async () => {
    await Haptics.selectionAsync();

    if (numberDraw || isRevealingNumber) {
      return;
    }

    setIsRevealingNumber(true);

    try {
      await waitForOracleReveal();
      const oracleUserKey = await getOracleUserKey(userStorageKey);
      const draw = await revealDailyNumberDraw(oracleUserKey);
      setNumberDraw(draw);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined
      );
      posthog.capture('daily_oracle_number_revealed', {
        habit_slug: habitSlug,
        number: draw.number,
      });
    } finally {
      setIsRevealingNumber(false);
    }
  };

  const openOraclePaywall = async () => {
    await Haptics.selectionAsync();

    posthog.capture('paywall_shown', {
      source: 'daily_oracle_tarot',
      habit_slug: habitSlug,
      is_pro: isPro,
    });

    router.push({
      pathname: '/habits',
      params: {
        showPaywall: 'oracle',
      },
    });
  };

  const handleRevealTarot = async () => {
    await Haptics.selectionAsync();

    if (!isPro) {
      await openOraclePaywall();
      return;
    }

    if (tarotDraw || isRevealingTarot) {
      return;
    }

    setIsRevealingTarot(true);

    try {
      await waitForOracleReveal();
      const oracleUserKey = await getOracleUserKey(userStorageKey);
      const draw = await revealDailyTarotDraw(oracleUserKey, habitSlug);
      setTarotDraw(draw);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined
      );
      posthog.capture('daily_oracle_tarot_revealed', {
        habit_slug: habitSlug,
        card: draw.id,
      });
    } finally {
      setIsRevealingTarot(false);
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
      habit_slug: habitSlug,
      day: currentDay,
      period: current.period,
      language,
    });

    router.push({
      pathname: '/deeper',
      params: {
        habit: habitSlug,
        day: String(currentDay),
        period: current.period,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backdrop}>
        <CovenantBackdrop
          habitSlug={habitSlug}
          intensity="subtle"
          variant="habit"
        />
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

          <View style={styles.oracleSection}>
            <Text style={styles.oracleLabel}>{t.oracleTitle}</Text>
            <Text style={styles.oracleIntro}>{t.oracleText}</Text>

            <View style={styles.oracleGrid}>
              <Pressable
                disabled={Boolean(numberDraw) || isRevealingNumber}
                onPress={handleRevealNumber}
                style={styles.oracleCard}
              >
                <View style={styles.oracleCardHeader}>
                  <SealOfDayIcon
                    active={isRevealingNumber}
                    number={numberDraw?.number}
                  />
                  <View style={styles.oracleCardTitleWrap}>
                    <Text style={styles.oracleCardKicker}>
                      {numberDraw ? t.todayNumber : t.numberTitle}
                    </Text>
                    <Text style={styles.oracleCardTitle}>
                      {numberDraw
                        ? `${numberDraw.number} — ${localize(
                            numberDraw.title,
                            language
                          )}`
                        : t.revealNumber}
                    </Text>
                  </View>
                </View>

                {numberDraw ? (
                  <View>
                    <Text style={styles.oracleMeaning}>
                      {localize(numberDraw.meaning, language)}
                    </Text>
                    <Text style={styles.oracleQuestionLabel}>
                      {t.reflectionQuestion}
                    </Text>
                    <Text style={styles.oracleQuestion}>
                      {localize(numberDraw.reflection, language)}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.oraclePrompt}>
                    {isRevealingNumber ? '...' : t.revealNumber}
                  </Text>
                )}
              </Pressable>

              <Pressable
                disabled={(isPro && Boolean(tarotDraw)) || isRevealingTarot}
                onPress={handleRevealTarot}
                style={[styles.oracleCard, !isPro && styles.oracleCardLocked]}
              >
                <View style={styles.oracleCardHeader}>
                  <MiniTarotOracleCard
                    active={isRevealingTarot}
                    card={isPro ? tarotDraw : null}
                    language={language}
                    locked={!isPro}
                  />
                  <View style={styles.oracleCardTitleWrap}>
                    <View style={styles.oracleTitleRow}>
                      <Text style={styles.oracleCardKicker}>
                        {isPro && tarotDraw ? t.todayCard : t.tarotTitle}
                      </Text>
                      {!isPro && (
                        <Text style={styles.oracleProBadge}>{t.proBadge}</Text>
                      )}
                    </View>
                    <Text style={styles.oracleCardTitle}>
                      {isPro && tarotDraw
                        ? `${tarotDraw.romanNumeral} ${localize(
                            tarotDraw.name,
                            language
                          )}`
                        : t.drawCard}
                    </Text>
                  </View>
                </View>

                {isPro && tarotDraw ? (
                  <View>
                    <CovenantTarotCard card={tarotDraw} language={language} />
                    <Text style={styles.oracleArchetype}>
                      {localize(tarotDraw.archetype, language)}
                    </Text>
                    <Text style={styles.oracleMeaning}>
                      {localize(tarotDraw.meaning, language)}
                    </Text>
                    <Text style={styles.oracleToday}>
                      {getHabitTarotReflection(tarotDraw, info.title, language)}
                    </Text>
                    <Text style={styles.oracleQuestionLabel}>
                      {t.reflectionQuestion}
                    </Text>
                    <Text style={styles.oracleQuestion}>
                      {localize(tarotDraw.question, language)}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.oraclePrompt}>
                    {!isPro
                      ? t.tarotLocked
                      : isRevealingTarot
                        ? '...'
                        : t.drawCard}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>

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
                  <View style={styles.actionContentRow}>
                    <CompleteSealIcon completed={completedToday} />
                    <Text
                      style={[
                        styles.completeText,
                        completedToday && styles.completedText,
                        isNight && styles.nightAccentText,
                      ]}
                    >
                      {completedToday ? t.completed : t.complete}
                    </Text>
                  </View>
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
                  <View style={styles.actionContentRow}>
                    <DeeperDivineIcon />
                    <Text style={styles.deeperText}>{t.deeper}</Text>
                  </View>
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
      <PremiumCelebration burstKey={celebrationKey} />
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

  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },

  celebrationOrigin: {
    position: 'absolute',
    left: '50%',
    bottom: 132,
    width: 1,
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  celebrationParticle: {
    position: 'absolute',
    shadowColor: '#D88C3A',
    shadowOpacity: 0.38,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  scroll: {
    paddingBottom: 120,
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 58,
  },

  backgroundGlow: {
    position: 'absolute',
    top: 86,
    alignSelf: 'center',
    width: 340,
    height: 340,
    borderRadius: 170,
    shadowColor: '#D88C3A',
    shadowOpacity: 0.22,
    shadowRadius: 58,
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
    marginBottom: 18,
  },

  headerCopy: {
    flex: 1,
    paddingRight: 18,
  },

  date: {
    color: '#F4F0EB',
    fontSize: 15,
    textTransform: 'capitalize',
    marginBottom: 10,
    fontWeight: '400',
  },

  nightDate: {
    color: '#B8B8B8',
  },

  day: {
    color: '#74706B',
    fontSize: 11,
    letterSpacing: 3,
    lineHeight: 17,
  },

  streakShell: {
    minWidth: 104,
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.28)',
    borderRadius: 22,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(8,7,6,0.58)',
    shadowColor: '#D88C3A',
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 12,
    },
  },

  streakLabel: {
    color: '#68615B',
    fontSize: 10,
    letterSpacing: 4,
    marginBottom: 7,
  },

  streak: {
    color: '#D88C3A',
    fontSize: 26,
    fontWeight: '300',
  },

  streakMeta: {
    color: '#8E847B',
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 5,
  },

  nightAccent: {
    color: '#A87442',
  },

  progressCard: {
    marginBottom: 56,
    borderRadius: 24,
    shadowColor: '#D88C3A',
    shadowOpacity: 0.18,
    shadowRadius: 36,
    shadowOffset: {
      width: 0,
      height: 18,
    },
  },

  progressBlur: {
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.28)',
    backgroundColor: 'rgba(9,8,7,0.72)',
    padding: 20,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  progressLabel: {
    color: '#A99A8A',
    fontSize: 10,
    letterSpacing: 5,
  },

  progressValue: {
    color: '#F1C58E',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
  },

  progressTrack: {
    height: 9,
    backgroundColor: 'rgba(255,255,255,0.075)',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 16,
  },

  progressBar: {
    height: '100%',
    backgroundColor: '#D88C3A',
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#D88C3A',
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  progressGlow: {
    flex: 1,
    backgroundColor: 'rgba(255,232,200,0.3)',
  },

  progressCaption: {
    color: '#AFA49A',
    fontSize: 11,
    letterSpacing: 2,
    lineHeight: 18,
  },

  oracleSection: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.34)',
    borderRadius: 26,
    backgroundColor: 'rgba(9,7,6,0.82)',
    padding: 20,
    marginBottom: 56,
    shadowColor: '#D88C3A',
    shadowOpacity: 0.22,
    shadowRadius: 42,
    shadowOffset: {
      width: 0,
      height: 20,
    },
  },

  oracleLabel: {
    color: '#D88C3A',
    fontSize: 10,
    letterSpacing: 5,
    fontWeight: '700',
    marginBottom: 10,
  },

  oracleIntro: {
    color: '#CABEAF',
    fontSize: 15,
    lineHeight: 25,
    marginBottom: 20,
  },

  oracleGrid: {
    gap: 14,
  },

  oracleCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,232,200,0.18)',
    borderRadius: 20,
    backgroundColor: 'rgba(14,11,9,0.9)',
    padding: 17,
    shadowColor: '#D88C3A',
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 12,
    },
  },

  oracleCardLocked: {
    borderColor: 'rgba(216,140,58,0.46)',
    backgroundColor: 'rgba(19,13,9,0.84)',
    shadowOpacity: 0.2,
  },

  oracleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },

  oracleCardTitleWrap: {
    flex: 1,
  },

  oracleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  oracleCardKicker: {
    color: '#8F8174',
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  oracleCardTitle: {
    color: '#FFF4E8',
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '500',
  },

  oracleProBadge: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.46)',
    borderRadius: 999,
    color: '#D88C3A',
    fontSize: 9,
    letterSpacing: 1.6,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  ritualIconCompact: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  daySeal: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,11,8,0.96)',
    shadowColor: '#D88C3A',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  daySealGlow: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(216,140,58,0.08)',
  },

  daySealOuter: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.54)',
  },

  daySealInner: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,232,200,0.18)',
  },

  daySealMarkTop: {
    position: 'absolute',
    top: 7,
    width: 10,
    height: 1,
    backgroundColor: 'rgba(241,197,142,0.54)',
  },

  daySealMarkBottom: {
    position: 'absolute',
    bottom: 7,
    width: 10,
    height: 1,
    backgroundColor: 'rgba(241,197,142,0.54)',
  },

  daySealNumber: {
    color: '#F7D4A5',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600',
    letterSpacing: 0,
  },

  miniTarotCard: {
    width: 50,
    height: 68,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.58)',
    backgroundColor: 'rgba(5,5,5,0.96)',
    shadowColor: '#D88C3A',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  miniTarotCardLocked: {
    borderColor: 'rgba(241,197,142,0.44)',
    opacity: 0.86,
  },

  miniTarotEdgeGlow: {
    position: 'absolute',
    top: 3,
    right: 3,
    bottom: 3,
    left: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,232,200,0.09)',
  },

  miniTarotTopMark: {
    position: 'absolute',
    top: 8,
    width: 14,
    height: 1,
    backgroundColor: 'rgba(241,197,142,0.54)',
  },

  miniTarotBottomMark: {
    position: 'absolute',
    bottom: 8,
    width: 14,
    height: 1,
    backgroundColor: 'rgba(241,197,142,0.54)',
  },

  miniTarotCenterLine: {
    width: 20,
    height: 1,
    backgroundColor: 'rgba(216,140,58,0.35)',
    marginTop: 5,
  },

  miniTarotName: {
    color: '#F7D4A5',
    fontSize: 8,
    lineHeight: 10,
    letterSpacing: 0.7,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
    paddingHorizontal: 5,
  },

  numberSigil: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.58)',
    backgroundColor: 'rgba(216,140,58,0.12)',
    shadowColor: '#D88C3A',
    shadowOpacity: 0.34,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  numberSigilOuter: {
    position: 'absolute',
    width: '78%',
    height: '78%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,232,200,0.30)',
  },

  numberSigilInner: {
    position: 'absolute',
    width: '48%',
    height: '48%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.42)',
  },

  numberSigilRay: {
    position: 'absolute',
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(216,140,58,0.30)',
  },

  numberSigilRayTurn: {
    transform: [{ rotate: '90deg' }],
  },

  numberSigilGlyph: {
    color: '#F7D4A5',
    fontSize: 13,
    letterSpacing: 1.4,
    fontWeight: '800',
  },

  tarotOracleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,232,200,0.20)',
    backgroundColor: 'rgba(8,7,6,0.82)',
    shadowColor: '#F1C58E',
    shadowOpacity: 0.38,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  tarotOracleCard: {
    position: 'absolute',
    width: 24,
    height: 34,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.72)',
    backgroundColor: 'rgba(20,14,10,0.92)',
    transform: [{ rotate: '-8deg' }],
  },

  tarotOracleMoon: {
    position: 'absolute',
    width: 26,
    height: 36,
    borderRadius: 999,
    borderRightWidth: 3,
    borderRightColor: 'rgba(255,232,200,0.74)',
    transform: [{ rotate: '18deg' }],
  },

  tarotOracleEye: {
    width: 28,
    height: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(241,197,142,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(3,3,3,0.50)',
  },

  tarotOraclePupil: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#F1C58E',
  },

  tarotOracleStar: {
    position: 'absolute',
    top: 7,
    right: 9,
    color: '#D8A060',
    fontSize: 8,
  },

  oraclePrompt: {
    color: '#CDBEAF',
    fontSize: 13,
    lineHeight: 22,
    letterSpacing: 1.2,
  },

  oracleArchetype: {
    color: '#D8A060',
    fontSize: 12,
    lineHeight: 19,
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  oracleMeaning: {
    color: '#E8DDD1',
    fontSize: 15,
    lineHeight: 25,
    marginBottom: 12,
  },

  oracleToday: {
    color: '#BBAEA1',
    fontSize: 14,
    lineHeight: 23,
    marginBottom: 14,
  },

  oracleQuestionLabel: {
    color: '#8F8174',
    fontSize: 9,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 7,
  },

  oracleQuestion: {
    color: '#F0C892',
    fontSize: 14,
    lineHeight: 23,
  },

  tarotArtwork: {
    alignSelf: 'center',
    width: 190,
    aspectRatio: 0.68,
    borderRadius: 18,
    backgroundColor: 'rgba(3,3,3,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.42)',
    padding: 9,
    marginTop: 2,
    marginBottom: 18,
    shadowColor: '#D88C3A',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: {
      width: 0,
      height: 12,
    },
  },

  tarotArtworkFrame: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,232,200,0.18)',
    borderRadius: 13,
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: 'rgba(13,10,8,0.96)',
  },

  tarotCornerTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 22,
    height: 22,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: 'rgba(216,140,58,0.50)',
  },

  tarotCornerTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(216,140,58,0.50)',
  },

  tarotCornerBottomLeft: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 22,
    height: 22,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: 'rgba(216,140,58,0.50)',
  },

  tarotCornerBottomRight: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 22,
    height: 22,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(216,140,58,0.50)',
  },

  tarotArtworkRoman: {
    color: '#F1C58E',
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 12,
  },

  tarotArtworkLine: {
    width: 64,
    height: 1,
    backgroundColor: 'rgba(216,140,58,0.42)',
    marginBottom: 18,
  },

  tarotSigil: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  tarotSigilOuterRing: {
    position: 'absolute',
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.44)',
  },

  tarotSigilInnerRing: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    borderColor: 'rgba(255,232,200,0.20)',
  },

  tarotSigilAxis: {
    position: 'absolute',
    width: 86,
    height: 1,
    backgroundColor: 'rgba(216,140,58,0.28)',
  },

  tarotSigilAxisWide: {
    width: 100,
  },

  tarotSigilAxisVertical: {
    transform: [{ rotate: '90deg' }],
  },

  tarotSigilAxisStrong: {
    height: 2,
    backgroundColor: 'rgba(216,140,58,0.44)',
  },

  tarotCrescent: {
    position: 'absolute',
    width: 42,
    height: 70,
    borderRadius: 999,
    borderRightWidth: 3,
    borderRightColor: 'rgba(255,232,200,0.72)',
    transform: [{ rotate: '18deg' }],
  },

  tarotRadiance: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tarotRay: {
    position: 'absolute',
    width: 1,
    height: 92,
    backgroundColor: 'rgba(216,140,58,0.30)',
  },

  tarotRayTilt: {
    transform: [{ rotate: '45deg' }],
  },

  tarotRayCross: {
    transform: [{ rotate: '90deg' }],
  },

  tarotDoubleOrbit: {
    position: 'absolute',
    width: 92,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.34)',
    borderRadius: 999,
    transform: [{ rotate: '-22deg' }],
  },

  tarotOrbitDot: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1C58E',
  },

  tarotOrbitDotOpposite: {
    left: undefined,
    right: 10,
  },

  tarotSigilGlyph: {
    color: '#F7D4A5',
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center',
    textShadowColor: 'rgba(216,140,58,0.42)',
    textShadowRadius: 12,
  },

  tarotSigilCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(241,197,142,0.72)',
    backgroundColor: 'rgba(216,140,58,0.12)',
  },

  tarotSigilCoreSquare: {
    borderRadius: 3,
    transform: [{ rotate: '45deg' }],
  },

  tarotStarRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },

  tarotStar: {
    color: '#D8A060',
    fontSize: 10,
  },

  tarotStarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(216,140,58,0.72)',
  },

  tarotStarLine: {
    width: 52,
    height: 1,
    backgroundColor: 'rgba(255,232,200,0.16)',
  },

  tarotArtworkName: {
    color: '#FFF4E8',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
    letterSpacing: 1.2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  hero: {
    marginBottom: 58,
  },

  period: {
    color: '#756C63',
    fontSize: 11,
    letterSpacing: 5,
    marginBottom: 22,
  },

  nightPeriod: {
    color: '#6C6762',
  },

  title: {
    color: '#FFF9F2',
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 38,
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
    fontSize: 31,
    lineHeight: 48,
    fontWeight: '300',
  },

  nightQuote: {
    color: '#D8D8D8',
  },

  author: {
    color: '#746C65',
    marginTop: 22,
    fontSize: 14,
    letterSpacing: 1,
  },

  scriptureBlock: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.17)',
    borderRadius: 24,
    backgroundColor: 'rgba(8,8,8,0.68)',
    padding: 22,
    marginTop: 34,
  },

  verseLine: {
    width: 42,
    height: 1,
    backgroundColor: 'rgba(216,140,58,0.52)',
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
    fontSize: 24,
    lineHeight: 38,
    fontStyle: 'italic',
    fontWeight: '300',
  },

  nightVerse: {
    color: '#CFCFCF',
  },

  reference: {
    color: '#81776E',
    marginTop: 22,
    fontSize: 14,
    letterSpacing: 1,
  },

  reflectionSection: {
    marginBottom: 74,
  },

  reflectionLabel: {
    color: '#766D63',
    fontSize: 10,
    letterSpacing: 6,
    marginBottom: 24,
  },

  reflection: {
    color: '#A69C92',
    fontSize: 26,
    lineHeight: 42,
    fontWeight: '300',
  },

  nightReflection: {
    color: '#838383',
  },

  footer: {
    marginBottom: 70,
  },

  completeButton: {
    minHeight: 68,
    backgroundColor: '#120F0C',
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.3)',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#D88C3A',
    shadowOpacity: 0.22,
    shadowRadius: 34,
    shadowOffset: {
      width: 0,
      height: 16,
    },
  },

  completedButton: {
    backgroundColor: 'rgba(17,13,9,0.96)',
    borderColor: 'rgba(216,140,58,0.42)',
    shadowOpacity: 0.22,
  },

  nightButton: {
    backgroundColor: '#090909',
    borderColor: 'rgba(168,116,66,0.22)',
  },

  buttonAura: {
    position: 'absolute',
    top: -42,
    width: 220,
    height: 84,
    borderRadius: 110,
    backgroundColor: 'rgba(216,140,58,0.22)',
  },

  actionContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 18,
  },

  completeText: {
    color: '#D8A060',
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 0,
    lineHeight: 18,
    flexShrink: 1,
  },

  completedText: {
    color: '#8E8984',
  },

  nightAccentText: {
    color: '#A87442',
  },

  deeperButton: {
    borderRadius: 22,
    shadowColor: '#D88C3A',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 16,
    },
  },

  deeperBlur: {
    minHeight: 66,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.22)',
    borderRadius: 22,
    backgroundColor: 'rgba(9,8,7,0.66)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deeperText: {
    color: '#F3EEE8',
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: '600',
  },

  completeSealIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.42)',
    backgroundColor: 'rgba(216,140,58,0.10)',
  },

  completeSealWon: {
    borderColor: 'rgba(241,197,142,0.66)',
    backgroundColor: 'rgba(216,140,58,0.18)',
    shadowColor: '#D88C3A',
    shadowOpacity: 0.36,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  completeSealRing: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,232,200,0.24)',
  },

  completeSealFlare: {
    position: 'absolute',
    width: 30,
    height: 1,
    backgroundColor: 'rgba(216,140,58,0.30)',
    transform: [{ rotate: '-28deg' }],
  },

  completeSealCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(241,197,142,0.74)',
    backgroundColor: 'rgba(216,140,58,0.18)',
  },

  completeSealGlyph: {
    color: '#F1C58E',
    fontSize: 15,
    lineHeight: 18,
  },

  deeperDivineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.34)',
    backgroundColor: 'rgba(216,140,58,0.08)',
  },

  deeperPortalRing: {
    position: 'absolute',
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,232,200,0.22)',
  },

  deeperPortalLine: {
    position: 'absolute',
    width: 28,
    height: 1,
    backgroundColor: 'rgba(216,140,58,0.34)',
  },

  deeperPortalLineTurn: {
    transform: [{ rotate: '90deg' }],
  },

  deeperDoorway: {
    width: 13,
    height: 21,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(241,197,142,0.68)',
    borderBottomWidth: 0,
    backgroundColor: 'rgba(3,3,3,0.24)',
  },

  supportCard: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.15)',
    borderRadius: 20,
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
