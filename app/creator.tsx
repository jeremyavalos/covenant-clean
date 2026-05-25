import { router } from "expo-router";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Screen from "../components/Screen";
import { colors } from "../constants/theme";

const INSTAGRAM_URL = "https://www.instagram.com/join.covenant.app";

export default function CreatorScreen() {
  function openInstagram() {
    Linking.openURL(INSTAGRAM_URL).catch(() => undefined);
  }

  return (
    <Screen backdropIntensity="subtle" backdropVariant="deeper">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.backText}>VOLVER</Text>
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.kicker}>EL CREADOR</Text>

          <Text style={styles.title}>
            Lo visible comienza donde nadie mira.
          </Text>

          <View style={styles.line} />

          <Text style={styles.body}>
            Covenant nace para sostener el trabajo silencioso: decirse la
            verdad, ordenar el impulso y reconstruir el carácter hasta que el
            cuerpo, la mente y la vida exterior respondan a la misma medida.
          </Text>

          <Text style={styles.bodySecondary}>
            No todo cambio empieza afuera. Primero se ordena lo invisible; luego
            el mundo recibe la forma de esa medida.
          </Text>

          <Pressable
            onPress={openInstagram}
            style={({ pressed }) => [
              styles.instagramLink,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.instagramKicker}>
              ACTUALIZACIONES, REFLEXIONES Y LANZAMIENTOS
            </Text>
            <Text style={styles.instagramHandle}>@join.covenant.app</Text>
          </Pressable>

          <Text style={styles.seal}>COVENANT</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 58,
    paddingBottom: 80,
  },

  backButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(216,140,58,0.28)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(5,5,5,0.62)",
  },

  pressed: {
    opacity: 0.72,
  },

  backText: {
    color: colors.accent,
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 70,
  },

  kicker: {
    color: colors.accent,
    fontSize: 10,
    letterSpacing: 7,
    marginBottom: 30,
    opacity: 0.82,
    textAlign: "center",
  },

  title: {
    color: "#FFF8EF",
    fontSize: 34,
    lineHeight: 44,
    fontWeight: "300",
    textAlign: "center",
    marginBottom: 32,
  },

  line: {
    width: 88,
    height: 1,
    backgroundColor: "rgba(216,140,58,0.46)",
    marginBottom: 32,
  },

  body: {
    maxWidth: 340,
    color: "#B9AFA3",
    fontSize: 16,
    lineHeight: 28,
    fontWeight: "300",
    textAlign: "center",
  },

  bodySecondary: {
    maxWidth: 326,
    color: "#8F867E",
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "300",
    textAlign: "center",
    marginTop: 22,
  },

  instagramLink: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(216,140,58,0.2)",
    borderRadius: 18,
    backgroundColor: "rgba(10,10,10,0.58)",
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginTop: 34,
  },

  instagramKicker: {
    color: "#716960",
    fontSize: 9,
    letterSpacing: 2.2,
    lineHeight: 15,
    textAlign: "center",
    marginBottom: 8,
  },

  instagramHandle: {
    color: colors.accent,
    fontSize: 12,
    letterSpacing: 2,
  },

  seal: {
    color: "#716960",
    fontSize: 10,
    letterSpacing: 6,
    marginTop: 40,
  },
});
