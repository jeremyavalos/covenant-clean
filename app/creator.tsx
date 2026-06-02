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
const CREATOR_EMAIL = "jeremy.avalos@protonmail.com";
const BTC_ADDRESS = "bc1qpq6qqczzt93kk6wf4plw8763vc82hk2xrl3dg3";
const CLABE = "722969013380554187";

export default function CreatorScreen() {
  function openInstagram() {
    Linking.openURL(INSTAGRAM_URL).catch(() => undefined);
  }

  function openEmail() {
    Linking.openURL(`mailto:${CREATOR_EMAIL}`).catch(() => undefined);
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

          <Text style={styles.creatorCredit}>
            Covenant fue creado por Jeremy Avalos.
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionKicker}>COLABORACIONES</Text>
            <Text style={styles.sectionText}>
              Para colaboraciones, desarrollo de apps, páginas web o proyectos
              digitales:
            </Text>
            <Pressable
              onPress={openEmail}
              style={({ pressed }) => [
                styles.valuePill,
                pressed && styles.pressed,
              ]}
            >
              <Text selectable style={styles.valueText}>
                {CREATOR_EMAIL}
              </Text>
            </Pressable>
            <Text style={styles.copyHint}>Mantén presionado para copiar.</Text>
          </View>

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

          <View style={styles.section}>
            <Text style={styles.sectionKicker}>APOYAR</Text>
            <Text style={styles.sectionText}>
              Si Covenant te aporta valor y deseas apoyar su desarrollo:
            </Text>
            <View style={styles.donationBlock}>
              <Text style={styles.donationLabel}>BTC</Text>
              <Text selectable style={styles.donationValue}>
                {BTC_ADDRESS}
              </Text>
            </View>
            <View style={styles.donationBlock}>
              <Text style={styles.donationLabel}>CLABE</Text>
              <Text selectable style={styles.donationValue}>
                {CLABE}
              </Text>
              <Text style={styles.donationMeta}>Mercado Pago</Text>
            </View>
            <Text style={styles.copyHint}>Datos seleccionables para copiar.</Text>
          </View>

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
    paddingBottom: 96,
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
    paddingTop: 58,
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
    fontSize: 32,
    lineHeight: 42,
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

  creatorCredit: {
    maxWidth: 320,
    color: "#D1B18C",
    fontSize: 13,
    lineHeight: 22,
    letterSpacing: 0.8,
    fontWeight: "300",
    textAlign: "center",
    marginTop: 28,
  },

  section: {
    width: "100%",
    maxWidth: 360,
    borderWidth: 1,
    borderColor: "rgba(216,140,58,0.18)",
    borderRadius: 18,
    backgroundColor: "rgba(8,8,8,0.52)",
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginTop: 28,
  },

  sectionKicker: {
    color: "#A87442",
    fontSize: 9,
    letterSpacing: 4,
    marginBottom: 12,
    textAlign: "center",
  },

  sectionText: {
    color: "#A79C90",
    fontSize: 14,
    lineHeight: 23,
    fontWeight: "300",
    textAlign: "center",
    marginBottom: 14,
  },

  valuePill: {
    alignSelf: "center",
    maxWidth: "100%",
    borderWidth: 1,
    borderColor: "rgba(216,140,58,0.24)",
    borderRadius: 999,
    backgroundColor: "rgba(216,140,58,0.07)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  valueText: {
    color: "#E0B178",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  copyHint: {
    color: "#625B54",
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1.1,
    textAlign: "center",
    marginTop: 12,
  },

  instagramLink: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(216,140,58,0.24)",
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

  donationBlock: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 14,
    marginTop: 12,
  },

  donationLabel: {
    color: "#766D63",
    fontSize: 9,
    letterSpacing: 3,
    marginBottom: 8,
    textAlign: "center",
  },

  donationValue: {
    color: "#D8A060",
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
  },

  donationMeta: {
    color: "#716960",
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 4,
  },

  seal: {
    color: "#716960",
    fontSize: 10,
    letterSpacing: 6,
    marginTop: 40,
  },
});
