import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CovenantBackdrop from "../components/CovenantBackdrop";
import { colors } from "../constants/theme";
import { apiFetch } from "../utils/api";
import { getLanguage, Language } from "../utils/language";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams();
  const [language, setLanguage] = useState<Language>("es");
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    getLanguage().then(setLanguage);
  }, []);

  const t =
    language === "es"
      ? {
          kicker: "COVENANT",
          verifying: "Verificando tu correo.",
          success: "Correo verificado. Ya puedes entrar.",
          failed: "El enlace es inválido o expiró.",
          action: "ENTRAR",
        }
      : {
          kicker: "COVENANT",
          verifying: "Verifying your email.",
          success: "Email verified. You can enter now.",
          failed: "This link is invalid or expired.",
          action: "LOGIN",
        };

  useEffect(() => {
    const token =
      typeof params.token === "string" ? params.token : "";

    if (!token) {
      setVerified(false);
      setLoading(false);
      return;
    }

    apiFetch("/auth/verify-email", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ token }),
    })
      .then(() => {
        setVerified(true);
      })
      .catch(() => {
        setVerified(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.token]);

  return (
    <SafeAreaView style={styles.container}>
      <CovenantBackdrop intensity="strong" variant="habit" />
      <LinearGradient
        colors={[
          "rgba(0,0,0,0.10)",
          "rgba(0,0,0,0.72)",
          "rgba(0,0,0,0.96)",
        ]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Text style={styles.kicker}>{t.kicker}</Text>

        <BlurView intensity={24} tint="dark" style={styles.panel}>
          {loading ? (
            <ActivityIndicator color="#FFD1A0" />
          ) : (
            <>
              <Text style={styles.title}>
                {verified ? t.success : t.failed}
              </Text>
              <Pressable
                onPress={() => router.replace("/auth" as never)}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{t.action}</Text>
              </Pressable>
            </>
          )}

          {loading ? (
            <Text style={styles.title}>{t.verifying}</Text>
          ) : null}
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030303",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  kicker: {
    color: colors.accent,
    fontSize: 10,
    letterSpacing: 6,
    marginBottom: 18,
    textAlign: "center",
  },
  panel: {
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(216,140,58,0.34)",
    backgroundColor: "rgba(6,6,6,0.58)",
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 38,
    marginTop: 18,
    textAlign: "center",
  },
  button: {
    minHeight: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(216,110,34,0.22)",
    borderWidth: 1,
    borderColor: "rgba(216,140,58,0.62)",
    marginTop: 24,
  },
  buttonText: {
    color: "#FFD1A0",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 4,
  },
});
