import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  useState,
} from "react";

import {
  useRouter,
} from "expo-router";

import Screen from "../components/Screen";

import FadeIn from "../components/FadeIn";

import {
  colors,
} from "../constants/theme";

import {
  useAuthStore,
} from "../store/authStore";

import {
  clearProgressUser,
} from "../utils/progress";

import {
  clearLegacyFreeHabit,
} from "../utils/freeHabit";

const habits = [
  "Ducha fría",
  "Ejercicio",
  "Dominar mente",
  "Fortaleza mental",
  "Sin vicios",
  "Escritura",
  "Gratitud",
  "Silencio",
  "Dominio",
  "Meditación",
];

export default function HabitsScreen() {

  const router = useRouter();
  const logout =
    useAuthStore(
      (state) => state.logout
    );

  const [
    selectedHabit,
    setSelectedHabit,
  ] = useState("");

  async function selectHabit(
    habit: string
  ) {

    setSelectedHabit(habit);

    setTimeout(() => {

      router.push("/home");

    }, 300);

  }

  async function handleLogout() {
    await logout();
    await clearProgressUser();
    await clearLegacyFreeHabit();

    router.replace(
      "/auth" as never
    );
  }

  return (

    <Screen>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 32,
          paddingTop: 80,
          paddingBottom: 120,
        }}
      >

        <FadeIn>

          <Text
            style={{
              color: colors.soft,
              fontSize: 15,
              textAlign: "center",
              marginBottom: 20,
              letterSpacing: 8,
            }}
          >
            DISCIPLINAS
          </Text>

          <Text
            style={{
              color: colors.text,
              fontSize: 42,
              lineHeight: 60,
              textAlign: "center",
              fontWeight: "300",
              marginBottom: 28,
            }}
          >
            Elige aquello
            {"\n"}
            que estás dispuesto
            {"\n"}
            a confrontar.
          </Text>

          <Text
            style={{
              color: colors.muted,
              textAlign: "center",
              fontSize: 19,
              lineHeight: 36,
              marginBottom: 70,
            }}
          >
            Versión gratuita:
            {"\n"}
            un hábito.
          </Text>

          <View
            style={{
              borderWidth: 1,
              borderColor: colors.divider,
              paddingVertical: 42,
              paddingHorizontal: 28,
              marginBottom: 90,
              borderRadius: 34,
              backgroundColor: "rgba(255,255,255,0.02)",
            }}
          >

            <Text
              style={{
                color: colors.text,
                fontSize: 26,
                textAlign: "center",
                marginBottom: 34,
                fontWeight: "300",
              }}
            >
              COVENANT PRO
            </Text>

            <Text
              style={{
                color: colors.muted,
                textAlign: "center",
                fontSize: 19,
                lineHeight: 38,
              }}
            >
              Reflexiones nocturnas.
              {"\n"}
              Hasta 4 disciplinas.
              {"\n"}
              Profundidad completa.
            </Text>

            <Text
              style={{
                color: colors.soft,
                textAlign: "center",
                marginTop: 38,
                fontSize: 18,
                letterSpacing: 4,
              }}
            >
              $1.99 USD / MES
            </Text>

          </View>

          {habits.map(
            (habit) => (

              <TouchableOpacity
                key={habit}
                activeOpacity={0.8}
                onPress={() =>
                  selectHabit(habit)
                }
                style={{
                  marginBottom: 55,
                }}
              >

                <Text
                  style={{
                    color:

                      selectedHabit ===
                      habit

                        ? colors.text
                        : colors.muted,

                    textAlign: "center",

                    fontSize: 28,

                    fontWeight: "300",
                  }}
                >
                  {habit}
                </Text>

                <View
                  style={{
                    width: 70,

                    height: 1,

                    backgroundColor:

                      selectedHabit ===
                      habit

                        ? colors.accent
                        : colors.divider,

                    alignSelf: "center",

                    marginTop: 22,
                  }}
                />

              </TouchableOpacity>

            )
          )}

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleLogout}
            style={{
              marginTop: 28,
              borderWidth: 1,
              borderColor: "rgba(216,140,58,0.28)",
              borderRadius: 999,
              paddingVertical: 18,
              paddingHorizontal: 24,
              backgroundColor: "rgba(5,5,5,0.68)",
            }}
          >

            <Text
              style={{
                color: colors.accent,
                textAlign: "center",
                fontSize: 13,
                letterSpacing: 3,
                fontWeight: "600",
              }}
            >
              Cerrar sesión
            </Text>

          </TouchableOpacity>

        </FadeIn>

      </ScrollView>

    </Screen>

  );
}
