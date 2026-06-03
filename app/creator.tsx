import { router } from "expo-router";
import {
  useEffect,
  useState,
} from "react";
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
import {
  getLanguage,
  Language,
} from "../utils/language";

const INSTAGRAM_URL = "https://www.instagram.com/join.covenant.app";
const CREATOR_EMAIL = "jeremy.avalos@protonmail.com";
const BTC_ADDRESS = "bc1qpq6qqczzt93kk6wf4plw8763vc82hk2xrl3dg3";
const CLABE = "722969013380554187";

export default function CreatorScreen() {
  const [language, setLanguage] =
    useState<Language>("es");

  useEffect(() => {
    getLanguage().then(setLanguage).catch(() => undefined);
  }, []);

  function openInstagram() {
    Linking.openURL(INSTAGRAM_URL).catch(() => undefined);
  }

  function openEmail() {
    Linking.openURL(`mailto:${CREATOR_EMAIL}`).catch(() => undefined);
  }

  const t =
    language === "es"
      ? {
          back: "VOLVER",
          kicker: "EL CREADOR",
          title: "Lo visible comienza donde nadie mira.",
          body:
            "Covenant nace para sostener el trabajo silencioso: decirse la verdad, ordenar el impulso y reconstruir el carácter hasta que el cuerpo, la mente y la vida exterior respondan a la misma medida.",
          bodySecondary:
            "No todo cambio empieza afuera. Primero se ordena lo invisible; luego el mundo recibe la forma de esa medida.",
          creatorCredit: "Covenant fue creado por Jeremy Avalos.",
          collaborations: "COLABORACIONES",
          collaborationText:
            "Para colaboraciones, desarrollo de apps, páginas web o proyectos digitales:",
          copyHint: "Mantén presionado para copiar.",
          instagramKicker: "ACTUALIZACIONES, REFLEXIONES Y LANZAMIENTOS",
          support: "APOYAR",
          supportText:
            "Si Covenant te aporta valor y deseas apoyar su desarrollo:",
          selectableHint: "Datos seleccionables para copiar.",
        }
      : {
          back: "RETURN",
          kicker: "THE CREATOR",
          title: "Visible change begins where no one is looking.",
          body:
            "Covenant was built to hold the quiet work: telling the truth, ordering impulse, and rebuilding character until the body, the mind, and the life outside answer to the same measure.",
          bodySecondary:
            "Not every change begins outside. First the invisible is ordered; then the world receives the shape of that measure.",
          creatorCredit: "Covenant was created by Jeremy Avalos.",
          collaborations: "COLLABORATIONS",
          collaborationText:
            "For collaborations, app development, websites, or digital projects:",
          copyHint: "Press and hold to copy.",
          instagramKicker: "UPDATES, REFLECTIONS, AND RELEASES",
          support: "SUPPORT",
          supportText:
            "If Covenant brings you value and you want to support its development:",
          selectableHint: "Selectable details for copying.",
        };

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
          <Text style={styles.backText}>{t.back}</Text>
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.kicker}>{t.kicker}</Text>

          <Text style={styles.title}>
            {t.title}
          </Text>

          <View style={styles.line} />

          <Text style={styles.body}>
            {t.body}
          </Text>

          <Text style={styles.bodySecondary}>
            {t.bodySecondary}
          </Text>

          <Text style={styles.creatorCredit}>
            {t.creatorCredit}
          </Text>

          <View style={styles.section}>
            <Text style={styles.sectionKicker}>{t.collaborations}</Text>
            <Text style={styles.sectionText}>
              {t.collaborationText}
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
            <Text style={styles.copyHint}>{t.copyHint}</Text>
          </View>

          <Pressable
            onPress={openInstagram}
            style={({ pressed }) => [
              styles.instagramLink,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.instagramKicker}>
              {t.instagramKicker}
            </Text>
            <Text style={styles.instagramHandle}>@join.covenant.app</Text>
          </Pressable>

          <View style={styles.section}>
            <Text style={styles.sectionKicker}>{t.support}</Text>
            <Text style={styles.sectionText}>
              {t.supportText}
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
            <Text style={styles.copyHint}>{t.selectableHint}</Text>
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
    borderColor: "rgba(216,140,58,0.36)",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(10,8,6,0.66)",
    shadowColor: "#D88C3A",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
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
    opacity: 0.94,
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
    color: "#D1C5B7",
    fontSize: 16,
    lineHeight: 28,
    fontWeight: "300",
    textAlign: "center",
  },

  bodySecondary: {
    maxWidth: 326,
    color: "#AAA096",
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
    borderColor: "rgba(216,140,58,0.28)",
    borderRadius: 18,
    backgroundColor: "rgba(9,8,7,0.70)",
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginTop: 28,
    shadowColor: "#D88C3A",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 14,
    },
  },

  sectionKicker: {
    color: "#D8A060",
    fontSize: 9,
    letterSpacing: 4,
    marginBottom: 12,
    textAlign: "center",
  },

  sectionText: {
    color: "#BDB2A7",
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
    borderColor: "rgba(216,140,58,0.34)",
    borderRadius: 999,
    backgroundColor: "rgba(216,140,58,0.12)",
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
    color: "#8A8178",
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1.1,
    textAlign: "center",
    marginTop: 12,
  },

  instagramLink: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(216,140,58,0.34)",
    borderRadius: 18,
    backgroundColor: "rgba(10,8,6,0.72)",
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginTop: 34,
  },

  instagramKicker: {
    color: "#A79C90",
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
    borderTopColor: "rgba(255,232,200,0.10)",
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
