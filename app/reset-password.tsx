import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CovenantBackdrop from "../components/CovenantBackdrop";
import { colors } from "../constants/theme";
import { useAuthStore } from "../store/authStore";
import { getLanguage, Language } from "../utils/language";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const busy = useAuthStore((state) => state.busy);

  const [language, setLanguage] = useState<Language>("es");
  const [token, setToken] = useState(
    typeof params.token === "string" ? params.token : ""
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLanguage().then(setLanguage);
  }, []);

  const t =
    language === "es"
      ? {
          kicker: "COVENANT",
          title: "Restablece tu contraseña.",
          token: "token",
          password: "nueva contraseña",
          confirm: "confirmar contraseña",
          action: "RESTABLECER",
          success: "Contraseña restablecida. Ya puedes entrar.",
          mismatch: "Las contraseñas no coinciden.",
          generic: "No se pudo restablecer la contraseña.",
          back: "VOLVER A ENTRAR",
        }
      : {
          kicker: "COVENANT",
          title: "Reset your password.",
          token: "token",
          password: "new password",
          confirm: "confirm password",
          action: "RESET",
          success: "Password reset. You can enter now.",
          mismatch: "Passwords do not match.",
          generic: "Could not reset password.",
          back: "RETURN TO LOGIN",
        };

  async function submit() {
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError(t.mismatch);
      return;
    }

    try {
      await resetPassword({
        token: token.trim(),
        password,
      });

      setPassword("");
      setConfirmPassword("");
      setMessage(t.success);
    } catch (resetError) {
      setError(
        resetError instanceof Error ? resetError.message : t.generic
      );
    }
  }

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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <View style={styles.content}>
          <Text style={styles.kicker}>{t.kicker}</Text>
          <Text style={styles.title}>{t.title}</Text>

          <BlurView intensity={24} tint="dark" style={styles.panel}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setToken}
              placeholder={t.token}
              placeholderTextColor="rgba(255,255,255,0.32)"
              style={styles.input}
              value={token}
            />

            <TextInput
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder={t.password}
              placeholderTextColor="rgba(255,255,255,0.32)"
              secureTextEntry
              style={styles.input}
              value={password}
            />

            <TextInput
              autoCapitalize="none"
              onChangeText={setConfirmPassword}
              placeholder={t.confirm}
              placeholderTextColor="rgba(255,255,255,0.32)"
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {message ? <Text style={styles.notice}>{message}</Text> : null}

            <Pressable
              disabled={busy}
              onPress={submit}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                busy && styles.buttonBusy,
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#FFD1A0" />
              ) : (
                <Text style={styles.buttonText}>{t.action}</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.replace("/auth" as never)}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryText}>{t.back}</Text>
            </Pressable>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030303",
  },
  keyboard: {
    flex: 1,
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
  title: {
    color: colors.text,
    fontSize: 42,
    fontWeight: "300",
    lineHeight: 52,
    marginBottom: 34,
    textAlign: "center",
  },
  panel: {
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(216,140,58,0.34)",
    backgroundColor: "rgba(6,6,6,0.58)",
    padding: 18,
  },
  input: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(0,0,0,0.34)",
    color: colors.text,
    fontSize: 16,
    marginBottom: 14,
    paddingHorizontal: 18,
  },
  error: {
    color: "#FFB08C",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
    textAlign: "center",
  },
  notice: {
    color: "#FFD1A0",
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 14,
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
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  buttonBusy: {
    opacity: 0.82,
  },
  buttonText: {
    color: "#FFD1A0",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 4,
  },
  secondaryButton: {
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 4,
  },
  secondaryText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    textAlign: "center",
  },
});
