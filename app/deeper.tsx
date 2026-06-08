import { useCallback, useEffect, useState } from 'react';

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
import { useSubscription } from '../context/SubscriptionContext';
import { getStableDeeperEntry } from '../data/deeper';
import { useAuthStore } from '../store/authStore';
import { getGuestStorageKey } from '../utils/guestMode';
import { getLocalDateKey } from '../utils/dates';
import { getLanguage, Language } from '../utils/language';
import {
  OracleNumberDraw,
  OracleTarotDraw,
  getDailyNumberDraw,
  getDailyTarotDraw,
  getOracleUserKey,
} from '../utils/oracle';
import {
  HabitProgress,
  getHabitProgress,
} from '../utils/progress';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

function localize(
  value: {
    en: string;
    es: string;
  },
  language: Language
) {
  return language === 'es' ? value.es : value.en;
}

function getStreakTone(streak: number, language: Language) {
  if (streak >= 21) {
    return language === 'es'
      ? 'La racha ya no está probando entusiasmo; está revelando identidad. En esta etapa, el peligro no suele ser debilidad, sino orgullo silencioso o automatismo.'
      : 'The streak is no longer testing enthusiasm; it is revealing identity. At this stage, the danger is usually not weakness, but quiet pride or automation.';
  }

  if (streak >= 7) {
    return language === 'es'
      ? 'La repetición empieza a dejar huella. Ya no estás demostrando que puedes empezar; estás aprendiendo si puedes permanecer.'
      : 'Repetition is beginning to leave a mark. You are no longer proving that you can start; you are learning whether you can remain.';
  }

  if (streak >= 2) {
    return language === 'es'
      ? 'La racha aún es joven, por eso importa más. Lo frágil revela si será protegido o negociado.'
      : 'The streak is still young, which is why it matters more. What is fragile reveals whether it will be protected or negotiated.';
  }

  return language === 'es'
    ? 'El primer día no es pequeño; es una ruptura con la inercia. Todavía no hay identidad estable, solo una puerta abierta que debe cruzarse otra vez.'
    : 'The first day is not small; it is a rupture with inertia. There is not yet a stable identity, only an open door that must be crossed again.';
}

function getCompletionTone(completedToday: boolean, language: Language) {
  if (completedToday) {
    return language === 'es'
      ? 'Hoy la acción ocurrió, pero la lectura más honesta está en la resistencia que apareció antes. La práctica no solo cuenta lo que hiciste; revela qué tuvo que perder poder para que lo hicieras.'
      : 'Today the action happened, but the more honest reading is in the resistance that appeared before it. The practice does not only count what you did; it reveals what had to lose power for you to do it.';
  }

  return language === 'es'
    ? 'Si todavía no completaste hoy, esta lectura no es condena; es una lámpara sobre la negociación actual. Lo pendiente muestra dónde la voluntad aún está siendo disputada.'
    : 'If you have not completed today, this reading is not condemnation; it is a lamp over the current negotiation. What remains undone shows where the will is still being contested.';
}

function getPeriodTone(period: 'morning' | 'night', language: Language) {
  if (period === 'night') {
    return language === 'es'
      ? 'La noche no pregunta por intención, sino por rastro. Al final del día, el cuerpo y la conciencia saben qué fue obedecido.'
      : 'Night does not ask about intention, but about trace. At the end of the day, the body and conscience know what was obeyed.';
  }

  return language === 'es'
    ? 'La mañana trabaja como umbral. Lo que gobierna temprano suele reclamar autoridad sobre el resto del día.'
    : 'Morning works like a threshold. What governs early often claims authority over the rest of the day.';
}

function getConsistencyTone(
  progress: HabitProgress | null,
  language: Language
) {
  const dates =
    progress?.completionDates?.filter(
      (date): date is string =>
        typeof date === 'string'
    ) ?? [];
  const recentDates = dates.slice(-7);

  if (recentDates.length >= 6) {
    return language === 'es'
      ? 'Tu patrón reciente muestra continuidad. Ahora la pregunta no es si puedes hacerlo, sino si puedes hacerlo sin volverte inconsciente dentro de la rutina.'
      : 'Your recent pattern shows continuity. Now the question is not whether you can do it, but whether you can do it without becoming unconscious inside the routine.';
  }

  if (recentDates.length >= 3) {
    return language === 'es'
      ? 'Tu patrón reciente muestra regreso, aunque todavía con interrupciones. El regreso rápido es una forma de humildad práctica.'
      : 'Your recent pattern shows return, though still with interruptions. Quick return is a form of practical humility.';
  }

  return language === 'es'
    ? 'Tu patrón reciente todavía está buscando suelo. No necesitas dramatizarlo; necesitas hacerlo lo bastante simple como para repetirlo.'
    : 'Your recent pattern is still looking for ground. You do not need to dramatize it; you need to make it simple enough to repeat.';
}

function getOracleTone(
  numberDraw: OracleNumberDraw | null,
  tarotDraw: OracleTarotDraw | null,
  isPro: boolean,
  language: Language
) {
  const numberText = numberDraw
    ? language === 'es'
      ? `El número de hoy, ${numberDraw.number} — ${localize(numberDraw.title, language)}, marca esta práctica como una reflexión sobre ${localize(numberDraw.title, language).toLowerCase()}.`
      : `Today’s number, ${numberDraw.number} — ${localize(numberDraw.title, language)}, marks this practice as a reflection on ${localize(numberDraw.title, language).toLowerCase()}.`
    : language === 'es'
      ? 'Sin número revelado, el símbolo queda en silencio; incluso eso pregunta qué guía esperas antes de actuar.'
      : 'With no number revealed, the symbol remains silent; even that asks what guidance you wait for before acting.';

  if (isPro && tarotDraw) {
    return language === 'es'
      ? `${numberText} La carta, ${localize(tarotDraw.name, language)}, añade una imagen más profunda: ${localize(tarotDraw.archetype, language).toLowerCase()}`
      : `${numberText} The card, ${localize(tarotDraw.name, language)}, adds a deeper image: ${localize(tarotDraw.archetype, language).toLowerCase()}`;
  }

  return numberText;
}

function composeDeeperReading({
  habitSlug,
  entry,
  language,
  progress,
  numberDraw,
  tarotDraw,
  isPro,
  period,
}: {
  habitSlug: string;
  entry: {
    evident: string;
    hint: string;
    deep: string;
    reflection: string;
    question?: string;
  };
  language: Language;
  progress: HabitProgress | null;
  numberDraw: OracleNumberDraw | null;
  tarotDraw: OracleTarotDraw | null;
  isPro: boolean;
  period: 'morning' | 'night';
}) {
  const habitCopy =
    HABIT_LAYER_COPY[habitSlug] ??
    HABIT_LAYER_COPY.discipline;
  const today = getLocalDateKey();
  const completedToday =
    progress?.lastCompleted === today;
  const streak =
    progress?.streak ?? 0;

  return {
    evident: `${entry.evident} ${getCompletionTone(
      completedToday,
      language
    )}`,
    hint: `${entry.hint} ${getStreakTone(
      streak,
      language
    )}`,
    deep: `${entry.deep} ${getPeriodTone(
      period,
      language
    )} ${getOracleTone(
      numberDraw,
      tarotDraw,
      isPro,
      language
    )}`,
    question:
      entry.question ||
      habitCopy.confrontation[language],
    seal:
      entry.reflection.length > 0
        ? `${entry.reflection} ${getConsistencyTone(
            progress,
            language
          )}`
        : '',
  };
}

const HABIT_LAYER_COPY: Record<
  string,
  {
    literal: Record<Language, string>;
    psychological: Record<Language, string>;
    symbolic: Record<Language, string>;
    confrontation: Record<Language, string>;
  }
> = {
  coldShower: {
    literal: {
      es: 'El agua fría no fue el centro del ritual; fue el umbral. Antes de entrar, apareció la parte de ti que busca una salida razonable.',
      en: 'The cold water was not the center of the ritual; it was the threshold. Before entering, the part of you that wants a reasonable escape appeared.',
    },
    psychological: {
      es: 'La incomodidad revela cuánta autoridad entregas al cuerpo cuando protesta. La disciplina comienza cuando escuchas la alarma interna sin convertirla en orden.',
      en: 'Discomfort reveals how much authority you give the body when it protests. Discipline begins when you hear the inner alarm without turning it into a command.',
    },
    symbolic: {
      es: 'El frío funciona como una pequeña iniciación: entrar voluntariamente donde el instinto prefiere huir. Ahí el miedo deja de ser muro y se vuelve puerta.',
      en: 'Cold becomes a small initiation: entering voluntarily where instinct prefers to flee. There fear stops being a wall and becomes a door.',
    },
    confrontation: {
      es: '¿Qué temor sigues tratando como ley solo porque se siente intenso?',
      en: 'What fear are you still treating as law simply because it feels intense?',
    },
  },
  exercise: {
    literal: {
      es: 'Hoy el cuerpo tuvo que responder, no solo imaginar cambio. El esfuerzo mostró la distancia entre intención y obediencia.',
      en: 'Today the body had to respond, not merely imagine change. Effort showed the distance between intention and obedience.',
    },
    psychological: {
      es: 'El cuerpo suele registrar la verdad antes que la mente la admita. La repetición física entrena tolerancia a la fricción y reduce la dependencia de motivación.',
      en: 'The body often records truth before the mind admits it. Physical repetition trains tolerance for friction and weakens dependence on motivation.',
    },
    symbolic: {
      es: 'El entrenamiento es una forja: no castiga al cuerpo, lo vuelve testigo de una voluntad más alta. Cada repetición convierte resistencia en forma.',
      en: 'Training is a forge: it does not punish the body, it makes it witness to a higher will. Each repetition turns resistance into form.',
    },
    confrontation: {
      es: '¿Tu cansancio de hoy fue límite real o una negociación elegante con la comodidad?',
      en: 'Was today’s fatigue a real limit or an elegant negotiation with comfort?',
    },
  },
  meditation: {
    literal: {
      es: 'Hoy te sentaste frente al movimiento de la mente. La práctica no exigía silencio perfecto, sino presencia sin obediencia automática.',
      en: 'Today you sat before the movement of the mind. The practice did not require perfect silence, but presence without automatic obedience.',
    },
    psychological: {
      es: 'Muchos pensamientos parecen autoridad solo porque llegan con fuerza. Observarlos sin seguirlos rompe la confusión entre aparición y verdad.',
      en: 'Many thoughts feel authoritative only because they arrive with force. Observing them without following them breaks the confusion between appearance and truth.',
    },
    symbolic: {
      es: 'La quietud es un espejo oscuro: al principio muestra ruido, luego forma. Lo que no persigues empieza a revelar su tamaño real.',
      en: 'Stillness is a dark mirror: at first it shows noise, then form. What you do not chase begins to reveal its true size.',
    },
    confrontation: {
      es: '¿Qué pensamiento pierde poder cuando dejas de discutir con él?',
      en: 'What thought loses power when you stop arguing with it?',
    },
  },
  silence: {
    literal: {
      es: 'Hoy el silencio quitó una capa de estímulo. Lo que apareció después importa más que la ausencia de sonido.',
      en: 'Today silence removed a layer of stimulation. What appeared afterward matters more than the absence of sound.',
    },
    psychological: {
      es: 'El ruido constante puede funcionar como anestesia emocional. Cuando desaparece, la mente revela lo que estaba posponiendo.',
      en: 'Constant noise can function as emotional anesthesia. When it disappears, the mind reveals what it has been postponing.',
    },
    symbolic: {
      es: 'El silencio es una cámara interior: no te entretiene, te devuelve. En esa devolución aparece una verdad menos adornada.',
      en: 'Silence is an inner chamber: it does not entertain you, it returns you to yourself. In that return a less decorated truth appears.',
    },
    confrontation: {
      es: '¿Qué parte de ti necesita ruido para no ser escuchada?',
      en: 'What part of you needs noise so it will not be heard?',
    },
  },
  writing: {
    literal: {
      es: 'Hoy la palabra hizo visible algo que estaba disperso. Escribir no fue producir; fue ordenar lo que pedía forma.',
      en: 'Today the word made visible something that was scattered. Writing was not production; it was giving form to what asked for order.',
    },
    psychological: {
      es: 'Lo no escrito suele seguir actuando desde la sombra. Cuando lo nombras, deja de gobernar como sensación vaga.',
      en: 'What remains unwritten often keeps acting from the shadow. When you name it, it stops ruling as a vague sensation.',
    },
    symbolic: {
      es: 'La página es altar y espejo: recibe sin aplaudir y refleja sin suavizar. Ahí la verdad puede aparecer sin teatro.',
      en: 'The page is altar and mirror: it receives without applauding and reflects without softening. There truth can appear without theater.',
    },
    confrontation: {
      es: '¿Qué verdad cambia de peso cuando finalmente la escribes completa?',
      en: 'What truth changes weight when you finally write it whole?',
    },
  },
  gratitude: {
    literal: {
      es: 'Hoy dirigiste atención hacia lo que normalmente se vuelve invisible. La gratitud no negó la dificultad; corrigió la mirada.',
      en: 'Today you directed attention toward what usually becomes invisible. Gratitude did not deny difficulty; it corrected the gaze.',
    },
    psychological: {
      es: 'La mente entrenada en carencia convierte incluso lo suficiente en deuda. Reconocer lo recibido interrumpe esa hambre sin fondo.',
      en: 'A mind trained in lack turns even enough into debt. Recognizing what has been received interrupts that bottomless hunger.',
    },
    symbolic: {
      es: 'La gratitud es una lámpara baja: no elimina la noche, pero revela lo que ya estaba allí. Ver también es una forma de disciplina.',
      en: 'Gratitude is a low lamp: it does not remove the night, but reveals what was already there. Seeing is also a form of discipline.',
    },
    confrontation: {
      es: '¿Qué bendición se volvió ordinaria porque dejaste de mirarla?',
      en: 'What blessing became ordinary because you stopped looking at it?',
    },
  },
  noVices: {
    literal: {
      es: 'Hoy el impulso pidió entrada. La práctica fue notar la petición sin entregarle el mando.',
      en: 'Today impulse asked for entry. The practice was noticing the request without handing it command.',
    },
    psychological: {
      es: 'La compulsión rara vez llega diciendo destrucción; suele llegar prometiendo alivio. Disciplina es detectar el contrato antes de firmarlo.',
      en: 'Compulsion rarely arrives calling itself destruction; it usually promises relief. Discipline is detecting the contract before signing it.',
    },
    symbolic: {
      es: 'El vicio es una cadena que se presenta como llave. Cada negativa consciente devuelve un poco de territorio interior.',
      en: 'Vice is a chain presenting itself as a key. Each conscious refusal returns a little inner territory.',
    },
    confrontation: {
      es: '¿Qué impulso todavía recibe permiso porque lo llamas necesidad?',
      en: 'What impulse still receives permission because you call it need?',
    },
  },
  dominateMind: {
    literal: {
      es: 'Hoy viste que la mente no se gobierna por accidente. Algún pensamiento intentó dirigir el día antes de ser examinado.',
      en: 'Today you saw that the mind is not governed by accident. Some thought tried to direct the day before being examined.',
    },
    psychological: {
      es: 'La identidad se forma por lo que repites internamente, no solo por lo que haces externamente. Observar el pensamiento debilita su autoridad automática.',
      en: 'Identity is formed by what you repeat internally, not only by what you do externally. Observing thought weakens its automatic authority.',
    },
    symbolic: {
      es: 'La mente es un trono disputado. Cada pensamiento no examinado pide sentarse allí como rey.',
      en: 'The mind is a contested throne. Every unexamined thought asks to sit there as king.',
    },
    confrontation: {
      es: '¿Qué pensamiento gobierna porque nunca le has pedido credenciales?',
      en: 'What thought governs because you have never asked for its credentials?',
    },
  },
  mentalStrength: {
    literal: {
      es: 'Hoy entrenaste la capacidad de permanecer cuando el ánimo no coopera. Esa es una fuerza menos visible, pero más seria.',
      en: 'Today you trained the capacity to remain when mood does not cooperate. That is a less visible strength, but a more serious one.',
    },
    psychological: {
      es: 'La fortaleza mental no consiste en no sentir resistencia. Consiste en no dejar que la resistencia sea la última voz.',
      en: 'Mental strength is not the absence of resistance. It is refusing to let resistance have the final voice.',
    },
    symbolic: {
      es: 'La mente fuerte es una puerta cerrada con calma. No necesita gritar para impedir la entrada de lo que debilita.',
      en: 'The strong mind is a calmly closed door. It does not need to shout to deny entry to what weakens it.',
    },
    confrontation: {
      es: '¿Dónde sigues llamando personalidad a una debilidad entrenada?',
      en: 'Where are you still calling a trained weakness your personality?',
    },
  },
  discipline: {
    literal: {
      es: 'Hoy la palabra dada tuvo que encontrar cuerpo. La disciplina empieza cuando la promesa deja de ser idea y se vuelve acto.',
      en: 'Today the word given had to find a body. Discipline begins when the promise stops being an idea and becomes an act.',
    },
    psychological: {
      es: 'Cada incumplimiento enseña a la mente que tu palabra es negociable. Cada cumplimiento, aunque pequeño, repara autoridad interna.',
      en: 'Every broken promise teaches the mind that your word is negotiable. Every kept promise, however small, repairs inner authority.',
    },
    symbolic: {
      es: 'El pacto es un sello invisible. No vale por lo que anuncia, sino por lo que sostiene cuando nadie mira.',
      en: 'The covenant is an invisible seal. It is not measured by what it announces, but by what it sustains when no one is watching.',
    },
    confrontation: {
      es: '¿Qué parte de tu palabra sigues dejando abierta a negociación?',
      en: 'What part of your word are you still leaving open to negotiation?',
    },
  },
};

export default function DeeperScreen() {
  const { habit, day, period } = useLocalSearchParams();
  const habitSlug = String(habit);
  const { isPro } = useSubscription();
  const user = useAuthStore((state) => state.user);
  const [language, setLanguage] = useState<Language>('es');
  const [progress, setProgress] = useState<HabitProgress | null>(null);
  const [numberDraw, setNumberDraw] = useState<OracleNumberDraw | null>(null);
  const [tarotDraw, setTarotDraw] = useState<OracleTarotDraw | null>(null);

  const glow = useSharedValue(0.018);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.985);
  const heroShift = useSharedValue(18);
  const bodyShift = useSharedValue(28);

  const loadContext = useCallback(async () => {
    const currentLanguage = await getLanguage();
    setLanguage(currentLanguage);

    const currentProgress = await getHabitProgress(habitSlug);
    setProgress(currentProgress);

    const userStorageKey = user
      ? String(user.id || user.email)
      : getGuestStorageKey();
    const oracleUserKey = await getOracleUserKey(userStorageKey);

    const [dailyNumber, dailyTarot] = await Promise.all([
      getDailyNumberDraw(oracleUserKey),
      getDailyTarotDraw(oracleUserKey),
    ]);

    setNumberDraw(dailyNumber);
    setTarotDraw(dailyTarot);
  }, [habitSlug, user]);

  useEffect(() => {
    loadContext().catch(() => undefined);
  }, [loadContext]);

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

  const currentPeriod =
    period === 'night' ? 'night' : 'morning';
  const requestedDay = Number(day) || 1;
  const entry = getStableDeeperEntry({
    habitSlug,
    requestedDay,
    period: currentPeriod,
  });

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

  const deeperReading = composeDeeperReading({
    habitSlug,
    entry,
    language,
    progress,
    numberDraw,
    tarotDraw,
    isPro,
    period: currentPeriod,
  });

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
            <Text style={styles.body}>{deeperReading.evident}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>{t.hint}</Text>
            <Text style={styles.body}>{deeperReading.hint}</Text>
          </View>

          <BlurView intensity={18} tint="dark" style={styles.deepPanel}>
            <Text style={styles.labelGold}>{t.depth}</Text>
            <Text style={styles.deep}>{deeperReading.deep}</Text>
          </BlurView>

          <View style={styles.finalSection}>
            <Text style={styles.finalLabel}>{t.confront}</Text>
            <Text style={styles.question}>{deeperReading.question}</Text>
            <Text style={styles.contextSeal}>{deeperReading.seal}</Text>
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

  contextSeal: {
    color: '#A79A8E',
    fontSize: 15,
    lineHeight: 25,
    textAlign: 'center',
    fontWeight: '300',
    marginTop: 24,
    paddingHorizontal: 4,
  },

  seal: {
    color: '#6F675F',
    fontSize: 10,
    letterSpacing: 6,
    marginTop: 34,
  },
});
