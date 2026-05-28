import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  usePathname,
  useRootNavigationState,
  useRouter,
} from "expo-router";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Screen from "../components/Screen";

import FadeIn from "../components/FadeIn";

import {
  colors,
} from "../constants/theme";

import {
  Language,
  saveLanguage,
} from "../utils/language";

const PERSISTENCE_TIMEOUT_MS =
  8000;

const FALLBACK_NAVIGATION_DELAY_MS =
  500;

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout =
      setTimeout(() => {
        reject(
          new Error(
            "Language preference took too long to save."
          )
        );
      }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeout));
  });
}

export default function LanguageScreen() {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const rootNavigationState =
    useRootNavigationState();

  const pathnameRef =
    useRef(pathname);

  const isSelectingRef =
    useRef(false);

  const [
    selectedLanguage,
    setSelectedLanguage,
  ] = useState<Language | null>(null);

  useEffect(() => {
    pathnameRef.current =
      pathname;
  }, [pathname]);

  async function selectLanguage(
    language: Language
  ) {
    if (
      isSelectingRef.current ||
      selectedLanguage
    ) {
      return;
    }

    isSelectingRef.current =
      true;

    setSelectedLanguage(
      language
    );

    try {
      await withTimeout(
        saveLanguage(language),
        PERSISTENCE_TIMEOUT_MS
      );

      const navigateToTransition = () => {
        router.replace(
          "/transition"
        );
      };

      if (
        rootNavigationState?.key
      ) {
        navigateToTransition();
      } else {
        setTimeout(
          navigateToTransition,
          0
        );
      }

      setTimeout(() => {
        if (
          pathnameRef.current === "/language"
        ) {
          navigateToTransition();
        }
      }, FALLBACK_NAVIGATION_DELAY_MS);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Please try again.";

      Alert.alert(
        "Language not saved",
        message
      );

      isSelectingRef.current =
        false;

      setSelectedLanguage(
        null
      );
    }
  }

  return (

    <Screen backdropIntensity="medium" backdropVariant="language">

      <View
        style={{
          flex: 1,

          justifyContent:
            "center",

          alignItems: "center",

          paddingHorizontal: 26,

          width: "100%",
        }}
      >

        <View
          style={{
            width: "100%",
          }}
        >

          <FadeIn>

            <Text
              style={{
                color:
                  colors.accent,

                fontSize: 10,

                letterSpacing: 6,

                marginBottom: 28,

                opacity: 0.8,

                textAlign: "center",
              }}
            >
              LANGUAGE
            </Text>

            <Text
              style={{
                color:
                  colors.text,

                fontSize: 30,

                textAlign: "center",

                lineHeight: 42,

                fontWeight: "300",

                marginBottom: 34,
              }}
            >
              Cuando nadie
              {"\n"}
              ve lo que hago,
              {"\n"}
              yo sí lo veo.
            </Text>

            <View
              style={{
                width: 44,

                height: 1,

                alignSelf: "center",

                backgroundColor:
                  colors.divider,

                marginBottom: 34,

                opacity: 0.5,
              }}
            />

            <Text
              style={{
                color:
                  colors.soft,

                fontSize: 23,

                textAlign: "center",

                lineHeight: 34,

                marginBottom: 64,
              }}
            >
              When nobody
              {"\n"}
              sees what I do,
              {"\n"}
              I still see it.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={selectedLanguage !== null}

              onPress={() =>
                selectLanguage(
                  'es'
                )
              }

              style={[
                styles.languageButton,
                styles.firstButton,
                selectedLanguage !== null &&
                  styles.disabledButton,
              ]}
            >

              {selectedLanguage === "es"
                ? (
                    <ActivityIndicator
                      color={colors.accent}
                    />
                  )
                : (
                    <Text style={styles.languageButtonText}>
                      Español
                    </Text>
                  )}

            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={selectedLanguage !== null}

              onPress={() =>
                selectLanguage(
                  'en'
                )
              }

              style={[
                styles.languageButton,
                selectedLanguage !== null &&
                  styles.disabledButton,
              ]}
            >

              {selectedLanguage === "en"
                ? (
                    <ActivityIndicator
                      color={colors.accent}
                    />
                  )
                : (
                    <Text style={styles.languageButtonText}>
                      English
                    </Text>
                  )}

            </TouchableOpacity>

          </FadeIn>

        </View>

      </View>

    </Screen>

  );

}

const styles = StyleSheet.create({
  languageButton: {
    width: "100%",
    minHeight: 66,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.divider,
  },

  firstButton: {
    marginBottom: 20,
  },

  disabledButton: {
    opacity: 0.72,
  },

  languageButtonText: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "300",
  },
});
