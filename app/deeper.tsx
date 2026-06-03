import { useEffect, useState } from 'react';

import { BlurView } from 'expo-blur';
import { useLocalSearchParams } from 'expo-router';

import {
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
  withTiming,
} from 'react-native-reanimated';

import CovenantBackdrop from '../components/CovenantBackdrop';
import { getHabitEntry } from '../utils/habitEngine';
import { getLanguage, Language } from '../utils/language';

const HABIT_INFO: Record<
  string,
  {
    question: Record<Language, string>;
  }
> = {
  coldShower: {
    question: {
      es: '¿Permaneciste firme incluso en la incomodidad?',
      en: 'Did you remain steady even inside discomfort?',
    },
  },
  exercise: {
    question: {
      es: '¿Fortaleciste tu cuerpo conscientemente hoy?',
      en: 'Did you strengthen your body with intention today?',
    },
  },
  meditation: {
    question: {
      es: '¿Observaste tus pensamientos sin obedecerlos?',
      en: 'Did you observe your thoughts without obeying them?',
    },
  },
  silence: {
    question: {
      es: '¿Pudiste permanecer quieto contigo mismo?',
      en: 'Were you able to remain still with yourself?',
    },
  },
  writing: {
    question: {
      es: '¿Fuiste honesto al escribir hoy?',
      en: 'Were you honest in your writing today?',
    },
  },
  gratitude: {
    question: {
      es: '¿Reconociste lo que normalmente ignoras?',
      en: 'Did you recognize what you usually ignore?',
    },
  },
  noVices: {
    question: {
      es: '¿Dominaste el impulso o te dominó a ti?',
      en: 'Did you master the impulse, or did it master you?',
    },
  },
  dominateMind: {
    question: {
      es: '¿Controlaste tu mente hoy?',
      en: 'Did you govern your mind today?',
    },
  },
  mentalStrength: {
    question: {
      es: '¿Resististe aunque no tuvieras ganas?',
      en: 'Did you endure even when you did not feel like it?',
    },
  },
  discipline: {
    question: {
      es: '¿Cumpliste tu palabra hoy?',
      en: 'Did you keep your word today?',
    },
  },
};

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function DeeperScreen() {
  const { habit, day, period } = useLocalSearchParams();
  const habitSlug = String(habit);
  const [language, setLanguage] = useState<Language>('es');

  const glow = useSharedValue(0.018);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.985);
  const heroShift = useSharedValue(18);
  const bodyShift = useSharedValue(28);

  useEffect(() => {
    getLanguage().then(setLanguage);
  }, []);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 720,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withTiming(1, {
      duration: 760,
      easing: Easing.out(Easing.cubic),
    });
    heroShift.value = withTiming(0, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
    bodyShift.value = withDelay(
      180,
      withTiming(0, {
        duration: 740,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [bodyShift, heroShift, opacity, scale]);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(0.045, {
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0.014, {
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, [glow]);

  const entry = getHabitEntry(
    habitSlug,
    Number(day),
    period === 'night' ? 'night' : 'morning'
  );

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const heroStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: heroShift.value }, { scale: scale.value }],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: bodyShift.value }],
  }));

  if (!entry) {
    return null;
  }

  const info = HABIT_INFO[habitSlug] || HABIT_INFO.coldShower;

  const t =
    language === 'es'
      ? {
          beyond: 'MÁS ALLÁ DE LA SUPERFICIE',
          scripture: 'VERSO',
          evident: 'LO EVIDENTE',
          hint: 'LO QUE INSINÚA',
          depth: 'PROFUNDIDAD',
          confront: 'CONFRÓNTATE',
          seal: 'LECTURA PROFUNDA',
        }
      : {
          beyond: 'BEYOND THE SURFACE',
          scripture: 'SCRIPTURE',
          evident: 'THE OBVIOUS',
          hint: 'WHAT IT SUGGESTS',
          depth: 'DEPTH',
          confront: 'FACE YOURSELF',
          seal: 'DEEP READING',
        };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backdrop}>
        <CovenantBackdrop
          habitSlug={habitSlug}
          intensity="subtle"
          variant="deeper"
        />
        <Animated.View style={[styles.backgroundGlow, glowStyle]} />
        <View style={styles.topVeil} />
        <View style={styles.bottomVeil} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.hero, heroStyle]}>
          <Text style={styles.topLabel}>{t.beyond}</Text>

          <AnimatedBlurView intensity={20} tint="dark" style={styles.verseBlock}>
            <Text style={styles.microLabel}>{t.scripture}</Text>

            <Text style={styles.verse}>“{entry.verse}”</Text>

            <Text style={styles.reference}>{entry.reference}</Text>
          </AnimatedBlurView>
        </Animated.View>

        <Animated.View style={[styles.bodyWrap, bodyStyle]}>
          <View style={styles.divider}>
            <View style={styles.dividerGlow} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t.evident}</Text>
            <Text style={styles.body}>{entry.evident}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t.hint}</Text>
            <Text style={styles.body}>{entry.hint}</Text>
          </View>

          <BlurView intensity={18} tint="dark" style={styles.deepPanel}>
            <Text style={styles.labelGold}>{t.depth}</Text>
            <Text style={styles.deep}>{entry.deep}</Text>
          </BlurView>

          <View style={styles.finalSection}>
            <Text style={styles.finalLabel}>{t.confront}</Text>
            <Text style={styles.question}>{info.question[language]}</Text>
            <Text style={styles.seal}>{t.seal}</Text>
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

  backgroundGlow: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#B56F34',
    shadowColor: '#D88C3A',
    shadowOpacity: 0.16,
    shadowRadius: 58,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  topVeil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
    backgroundColor: 'rgba(255,255,255,0.018)',
  },

  bottomVeil: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 420,
    backgroundColor: 'rgba(0,0,0,0.76)',
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 64,
    paddingBottom: 180,
  },

  hero: {
    alignItems: 'center',
  },

  topLabel: {
    color: '#8C7661',
    fontSize: 10,
    letterSpacing: 6,
    marginBottom: 28,
    textAlign: 'center',
  },

  verseBlock: {
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.16)',
    borderRadius: 22,
    backgroundColor: 'rgba(7,7,7,0.58)',
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#D88C3A',
    shadowOpacity: 0.07,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 18,
    },
  },

  microLabel: {
    color: '#A87442',
    fontSize: 10,
    letterSpacing: 5.5,
    marginBottom: 22,
  },

  verse: {
    color: '#FFF6ED',
    fontSize: 32,
    lineHeight: 48,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '300',
  },

  reference: {
    color: '#8A8178',
    marginTop: 22,
    fontSize: 13,
    letterSpacing: 2,
  },

  bodyWrap: {
    marginTop: 62,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 58,
    overflow: 'hidden',
  },

  dividerGlow: {
    width: 88,
    height: 1,
    alignSelf: 'center',
    backgroundColor: 'rgba(216,140,58,0.42)',
  },

  section: {
    marginBottom: 58,
    alignItems: 'center',
  },

  label: {
    color: '#716960',
    fontSize: 10,
    letterSpacing: 6,
    marginBottom: 26,
    textAlign: 'center',
  },

  labelGold: {
    color: '#C88B4B',
    fontSize: 10,
    letterSpacing: 7,
    marginBottom: 28,
    textAlign: 'center',
  },

  body: {
    color: '#BDB4AA',
    fontSize: 20,
    lineHeight: 34,
    textAlign: 'center',
    fontWeight: '300',
  },

  deepPanel: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(216,140,58,0.12)',
    borderRadius: 24,
    backgroundColor: 'rgba(8,8,8,0.62)',
    paddingHorizontal: 22,
    paddingVertical: 28,
    marginBottom: 58,
  },

  deep: {
    color: '#FFF7EF',
    fontSize: 28,
    lineHeight: 44,
    textAlign: 'center',
    fontWeight: '300',
  },

  finalSection: {
    paddingTop: 46,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
  },

  finalLabel: {
    color: '#C88B4B',
    fontSize: 10,
    letterSpacing: 7,
    marginBottom: 30,
  },

  question: {
    color: '#FFF',
    fontSize: 30,
    lineHeight: 46,
    textAlign: 'center',
    fontWeight: '300',
  },

  seal: {
    color: '#6F675F',
    fontSize: 10,
    letterSpacing: 6,
    marginTop: 34,
  },
});
