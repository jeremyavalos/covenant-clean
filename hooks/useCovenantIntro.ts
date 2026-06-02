import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const ENABLE_COVENANT_INTRO = false;

const FIRST_INTRO_STORAGE_KEY = "hasSeenFirstIntro";

export type CovenantIntroMode = "first" | "daily";

type CovenantIntroState = {
  visible: boolean;
  mode: CovenantIntroMode;
  phrase: string;
  completeIntro: () => void;
};

const DAILY_PHRASES = [
  "Discipline over impulse",
  "Repeat with intention",
  "Inner order. Outer command",
];

function getDailyPhrase() {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return DAILY_PHRASES[dayIndex % DAILY_PHRASES.length];
}

export function useCovenantIntro(): CovenantIntroState {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CovenantIntroMode>("daily");
  const completedRef = useRef(false);

  const phrase = useMemo(getDailyPhrase, []);

  useEffect(() => {
    if (!ENABLE_COVENANT_INTRO) {
      return;
    }

    let active = true;
    const timeout = setTimeout(() => {
      if (active) {
        setVisible(false);
      }
    }, 5200);

    async function prepareIntro() {
      try {
        const hasSeenFirstIntro = await AsyncStorage.getItem(
          FIRST_INTRO_STORAGE_KEY
        );

        if (!active) {
          return;
        }

        setMode(hasSeenFirstIntro === "true" ? "daily" : "first");
        setVisible(true);
      } catch {
        if (active) {
          setMode("daily");
          setVisible(true);
        }
      }
    }

    prepareIntro();

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, []);

  const completeIntro = useCallback(async () => {
    if (completedRef.current) {
      return;
    }

    completedRef.current = true;
    setVisible(false);

    if (mode === "first") {
      await AsyncStorage.setItem(FIRST_INTRO_STORAGE_KEY, "true").catch(
        () => undefined
      );
    }
  }, [mode]);

  return {
    visible,
    mode,
    phrase,
    completeIntro,
  };
}
