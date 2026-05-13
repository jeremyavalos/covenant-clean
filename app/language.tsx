import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import Screen from "../components/Screen";

import FadeIn from "../components/FadeIn";

import {
  colors,
} from "../constants/theme";

import {
  saveLanguage,
} from "../utils/language";

export default function LanguageScreen() {

  async function selectLanguage(
    language: 'es' | 'en'
  ) {

    await saveLanguage(
      language
    );

    router.push(
      "/transition"
    );

  }

  return (

    <Screen backdropIntensity="medium" backdropVariant="language">

      <View
        style={{
          flex: 1,

          justifyContent:
            "center",

          alignItems: "center",

          paddingHorizontal: 34,

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

                fontSize: 11,

                letterSpacing: 8,

                marginBottom: 34,

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

                fontSize: 36,

                textAlign: "center",

                lineHeight: 54,

                fontWeight: "300",

                marginBottom: 42,
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

                marginBottom: 42,

                opacity: 0.5,
              }}
            />

            <Text
              style={{
                color:
                  colors.soft,

                fontSize: 28,

                textAlign: "center",

                lineHeight: 42,

                marginBottom: 88,
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

              onPress={() =>
                selectLanguage(
                  'es'
                )
              }

              style={{
                width: "100%",

                backgroundColor:
                  colors.card,

                borderRadius: 24,

                paddingVertical: 24,

                marginBottom: 20,

                alignItems: "center",

                borderWidth: 1,

                borderColor:
                  colors.divider,
              }}
            >

              <Text
                style={{
                  color:
                    colors.text,

                  fontSize: 24,

                  fontWeight: "300",
                }}
              >
                Español
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}

              onPress={() =>
                selectLanguage(
                  'en'
                )
              }

              style={{
                width: "100%",

                backgroundColor:
                  colors.card,

                borderRadius: 24,

                paddingVertical: 24,

                alignItems: "center",

                borderWidth: 1,

                borderColor:
                  colors.divider,
              }}
            >

              <Text
                style={{
                  color:
                    colors.text,

                  fontSize: 24,

                  fontWeight: "300",
                }}
              >
                English
              </Text>

            </TouchableOpacity>

          </FadeIn>

        </View>

      </View>

    </Screen>

  );

}
