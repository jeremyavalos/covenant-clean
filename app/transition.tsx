import {
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocalSearchParams,
  router,
} from "expo-router";

import Screen from "../components/Screen";

import FadeIn from "../components/FadeIn";

import {
  colors,
} from "../constants/theme";

import {
  getLanguage,
  Language,
} from "../utils/language";

import {
  useAuthStore,
} from "../store/authStore";

const AUTO_CONTINUE_DELAY_MS =
  2200;

const FALLBACK_CONTINUE_DELAY_MS =
  2600;

export default function TransitionScreen() {
  const params =
    useLocalSearchParams<{
      language?: Language;
    }>();

  const routeLanguage =
    params.language === 'en'
      ? 'en'
      : params.language === 'es'
        ? 'es'
        : null;

  const token =
    useAuthStore(
      (state) => state.token
    );

  const didContinueRef =
    useRef(false);

  const [
    language,
    setLanguage,
  ] = useState<Language>(
    routeLanguage === 'en'
      ? 'en'
      : 'es'
  );

  const continueToApp = useCallback(() => {
    if (didContinueRef.current) {
      return;
    }

    didContinueRef.current =
      true;

    router.replace(
      token || Platform.OS === "ios"
        ? "/habits"
        : "/auth"
    );
  }, [token]);

  useEffect(() => {
    if (routeLanguage) {
      setLanguage(routeLanguage);
      return;
    }

    let active =
      true;

    async function loadLanguage() {
      const currentLanguage =
        await getLanguage();

      if (active) {
        setLanguage(
          currentLanguage
        );
      }
    }

    loadLanguage();

    return () => {
      active =
        false;
    };

  }, [routeLanguage]);

  useEffect(() => {
    const timeout =
      setTimeout(() => {
        continueToApp();
      }, AUTO_CONTINUE_DELAY_MS);

    const fallbackTimeout =
      setTimeout(() => {
        continueToApp();
      }, FALLBACK_CONTINUE_DELAY_MS);

    return () => {
      clearTimeout(timeout);
      clearTimeout(fallbackTimeout);
    };
  }, [continueToApp]);

  const t =
    language === 'es'

      ? {

          title:
            'Todo lo que\nrepites\ntermina\nconstruyéndote.',

          description:
            'Tus hábitos moldean\ntu mente,\ntu cuerpo\ny tu espíritu.',

          button:
            'CONTINUAR',

        }

      : {

          title:
            'Everything\nyou repeat\nslowly\nbecomes you.',

          description:
            'Your habits shape\nyour mind,\nyour body\nand your spirit.',

          button:
            'CONTINUE',

        };

  return (

    <Screen backdropIntensity="subtle" backdropVariant="transition">

      <View
        style={{
          flex: 1,

          justifyContent:
            "center",

          paddingHorizontal: 42,
        }}
      >

        <FadeIn>

          <Text
            style={{
              color:
                colors.accent,

              fontSize: 11,

              letterSpacing: 8,

              textAlign: "center",

              marginBottom: 42,

              opacity: 0.75,
            }}
          >
            COVENANT
          </Text>

          <Text
            style={{
              color:
                colors.text,

              fontSize: 48,

              lineHeight: 66,

              fontWeight: "300",

              textAlign: "center",

              marginBottom: 54,
            }}
          >
            {t.title}
          </Text>

          <View
            style={{
              width: 44,

              height: 1,

              backgroundColor:
                colors.divider,

              alignSelf: "center",

              marginBottom: 54,

              opacity: 0.5,
            }}
          />

          <Text
            style={{
              color:
                colors.soft,

              fontSize: 20,

              lineHeight: 38,

              textAlign: "center",

              paddingHorizontal: 10,

              marginBottom: 112,
            }}
          >
            {t.description}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}

            onPress={continueToApp}

            style={{
              alignSelf: "center",
            }}
          >

            <Text
              style={{
                color:
                  colors.text,

                fontSize: 18,

                letterSpacing: 6,

                opacity: 0.88,
              }}
            >
              {t.button}
            </Text>

          </TouchableOpacity>

        </FadeIn>

      </View>

    </Screen>

  );

}
