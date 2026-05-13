import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useEffect,
  useState,
} from "react";

import {
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

export default function TransitionScreen() {

  const [
    language,
    setLanguage,
  ] = useState<Language>(
    'es'
  );

  useEffect(() => {

    loadLanguage();

  }, []);

  async function loadLanguage() {

    const currentLanguage =
      await getLanguage();

    setLanguage(
      currentLanguage
    );

  }

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

              fontSize: 52,

              lineHeight: 72,

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

              fontSize: 22,

              lineHeight: 42,

              textAlign: "center",

              paddingHorizontal: 10,

              marginBottom: 130,
            }}
          >
            {t.description}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}

            onPress={() =>
              router.push(
                "/habits"
              )
            }

            style={{
              alignSelf: "center",
            }}
          >

            <Text
              style={{
                color:
                  colors.text,

                fontSize: 18,

                letterSpacing: 8,

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
