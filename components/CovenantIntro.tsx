import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { CovenantIntroMode } from "../hooks/useCovenantIntro";

type Props = {
  mode: CovenantIntroMode;
  phrase: string;
  onFinish: () => void;
};

const FIRST_INTRO_DURATION_MS = 4600;
const DAILY_INTRO_DURATION_MS = 1350;

export default function CovenantIntro({
  mode,
  phrase,
  onFinish,
}: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const title = useRef(new Animated.Value(0)).current;
  const second = useRef(new Animated.Value(0)).current;
  const brand = useRef(new Animated.Value(0)).current;
  const eclipse = useRef(new Animated.Value(0)).current;

  const isFirstIntro = mode === "first";
  const duration = isFirstIntro
    ? FIRST_INTRO_DURATION_MS
    : DAILY_INTRO_DURATION_MS;

  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const titleStyle = useMemo(
    () => ({
      opacity: title,
      transform: [
        {
          translateY: title.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 0],
          }),
        },
      ],
    }),
    [title]
  );

  const secondStyle = useMemo(
    () => ({
      opacity: second,
      transform: [
        {
          translateY: second.interpolate({
            inputRange: [0, 1],
            outputRange: [18, 0],
          }),
        },
      ],
    }),
    [second]
  );

  const brandStyle = useMemo(
    () => ({
      opacity: brand,
      transform: [
        {
          scale: brand.interpolate({
            inputRange: [0, 1],
            outputRange: [0.96, 1],
          }),
        },
      ],
    }),
    [brand]
  );

  const eclipseStyle = useMemo(
    () => ({
      opacity: eclipse,
      transform: [
        {
          scale: eclipse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.88, 1],
          }),
        },
      ],
    }),
    [eclipse]
  );

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    if (isFirstIntro) {
      Animated.sequence([
        Animated.delay(280),
        Animated.parallel([
          Animated.timing(title, {
            toValue: 1,
            duration: 900,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(eclipse, {
            toValue: 1,
            duration: 1100,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(420),
        Animated.timing(second, {
          toValue: 1,
          duration: 850,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(560),
        Animated.timing(brand, {
          toValue: 1,
          duration: 720,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(eclipse, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(brand, {
          toValue: 1,
          duration: 620,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }

    finishTimer.current = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(onFinish);
    }, duration);

    return () => {
      if (finishTimer.current) {
        clearTimeout(finishTimer.current);
      }
    };
  }, [
    brand,
    duration,
    eclipse,
    fade,
    isFirstIntro,
    onFinish,
    second,
    title,
  ]);

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        styles.overlay,
        {
          opacity: fade,
        },
      ]}
    >
      <LinearGradient
        colors={["#020202", "#050505", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.texture} />

      <Animated.View style={[styles.eclipseWrap, eclipseStyle]}>
        <View style={styles.eclipseOuter} />
        <View style={styles.eclipseInner} />
      </Animated.View>

      {isFirstIntro ? (
        <View style={styles.firstContent}>
          <Animated.Text style={[styles.line, titleStyle]}>
            Everything repeated...
          </Animated.Text>
          <Animated.Text style={[styles.line, secondStyle]}>
            ...shapes who you become.
          </Animated.Text>
          <Animated.View style={[styles.brandBlock, brandStyle]}>
            <Text style={styles.brand}>COVENANT</Text>
            <Text style={styles.subtitle}>Inner Discipline</Text>
          </Animated.View>
        </View>
      ) : (
        <Animated.View style={[styles.dailyContent, brandStyle]}>
          <Text style={styles.dailyBrand}>COVENANT</Text>
          <Text style={styles.dailyPhrase}>{phrase}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "#000000",
    justifyContent: "center",
    zIndex: 1000,
  },

  texture: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(216,140,58,0.018)",
    opacity: 0.78,
  },

  eclipseWrap: {
    position: "absolute",
    top: "24%",
    width: 154,
    height: 154,
    alignItems: "center",
    justifyContent: "center",
  },

  eclipseOuter: {
    position: "absolute",
    width: 154,
    height: 154,
    borderRadius: 77,
    borderWidth: 1,
    borderColor: "rgba(216,140,58,0.34)",
    shadowColor: "#D88C3A",
    shadowOpacity: 0.24,
    shadowRadius: 30,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  eclipseInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#020202",
    borderWidth: 1,
    borderColor: "rgba(255,209,160,0.16)",
  },

  firstContent: {
    width: "100%",
    maxWidth: 520,
    paddingHorizontal: 28,
  },

  line: {
    color: "#F5F1EA",
    fontFamily: "Georgia",
    fontSize: 34,
    fontWeight: "300",
    lineHeight: 43,
    marginBottom: 14,
    textAlign: "center",
  },

  brandBlock: {
    alignItems: "center",
    marginTop: 46,
  },

  brand: {
    color: "#FFD1A0",
    fontSize: 31,
    fontWeight: "300",
    letterSpacing: 8,
    textAlign: "center",
  },

  subtitle: {
    color: "rgba(245,241,234,0.66)",
    fontSize: 13,
    letterSpacing: 3,
    marginTop: 14,
    textAlign: "center",
  },

  dailyContent: {
    alignItems: "center",
    paddingHorizontal: 24,
  },

  dailyBrand: {
    color: "#FFD1A0",
    fontSize: 18,
    fontWeight: "300",
    letterSpacing: 6,
    marginBottom: 12,
    textAlign: "center",
  },

  dailyPhrase: {
    color: "rgba(245,241,234,0.78)",
    fontSize: 15,
    letterSpacing: 1.6,
    textAlign: "center",
  },
});
