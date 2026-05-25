import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Screen from "../components/Screen";
import { colors } from "../constants/theme";

export default function CreatorScreen() {
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
    fontSize: 17,
    lineHeight: 30,
    fontWeight: "300",
    textAlign: "center",
  },

  seal: {
    color: "#716960",
    fontSize: 10,
    letterSpacing: 6,
    marginTop: 54,
  },
});
