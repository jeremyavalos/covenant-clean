import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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

type AuthMode = "login" | "register" | "forgot";

export default function AuthScreen() {
  const [language, setLanguage] = useState<Language>("es");
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    null
  );

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const resendVerification = useAuthStore(
    (state) => state.resendVerification
  );
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const busy = useAuthStore((state) => state.busy);
  const token = useAuthStore((state) => state.token);

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(18)).current;
  const pulse = useRef(new Animated.Value(0.35)).current;

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadLanguage() {
        const currentLanguage = await getLanguage();

        if (active) {
          setLanguage(currentLanguage);
        }
      }

      loadLanguage();

      return () => {
        active = false;
      };
    }, [])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 760,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.78,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fade, pulse, rise]);

  useEffect(() => {
    if (token) {
      router.replace("/habits" as never);
    }
  }, [token]);

  const t =
    language === "es"
      ? {
          kicker: "ACCESO COVENANT",
          loginTitle: "Vuelve al pacto.",
          registerTitle: "Entra con honestidad.",
          subtitle:
            "Tu progreso queda guardado. Tu disciplina vuelve contigo.",
          loginTab: "ENTRAR",
          registerTab: "REGISTRO",
          emailPlaceholder: "email",
          passwordPlaceholder: "contraseña",
          loginAction: "ENTRAR",
          registerAction: "CREAR PACTO",
          forgotTitle: "Recupera el acceso.",
          forgotAction: "ENVIAR INSTRUCCIONES",
          forgotPassword: "¿OLVIDASTE TU CONTRASEÑA?",
          backToLogin: "VOLVER A ENTRAR",
          createAccount: "CREAR CUENTA",
          haveAccount: "YA TENGO CUENTA",
          loading: "ABRIENDO",
          genericError: "No se pudo abrir la sesión.",
          invalidError: "Email o contraseña incorrectos.",
          registeredError: "Ese email ya está registrado.",
          unverifiedError: "Verifica tu correo antes de entrar.",
          verificationSent:
            "Te enviamos un correo de verificación. Revisa tu bandeja de entrada y correo no deseado.",
          resendVerification: "REENVIAR CORREO DE VERIFICACIÓN",
          resendSent:
            "Te enviamos otro correo de verificación.",
          forgotSent:
            "Si este correo existe, enviamos instrucciones para restablecer tu contraseña.",
        }
      : {
          kicker: "COVENANT ACCESS",
          loginTitle: "Return to the vow.",
          registerTitle: "Enter with honesty.",
          subtitle:
            "Your progress stays saved. Your discipline returns with you.",
          loginTab: "LOGIN",
          registerTab: "REGISTER",
          emailPlaceholder: "email",
          passwordPlaceholder: "password",
          loginAction: "ENTER",
          registerAction: "CREATE COVENANT",
          forgotTitle: "Recover access.",
          forgotAction: "SEND INSTRUCTIONS",
          forgotPassword: "FORGOT PASSWORD?",
          backToLogin: "RETURN TO LOGIN",
          createAccount: "CREATE ACCOUNT",
          haveAccount: "I HAVE AN ACCOUNT",
          loading: "OPENING",
          genericError: "Could not open the session.",
          invalidError: "Invalid email or password.",
          registeredError: "That email is already registered.",
          unverifiedError: "Please verify your email before entering.",
          verificationSent:
            "We sent you a verification email. Check your inbox and spam folder.",
          resendVerification: "RESEND VERIFICATION EMAIL",
          resendSent:
            "We sent another verification email.",
          forgotSent:
            "If this email exists, we sent password reset instructions.",
        };

  const title =
    mode === "login"
      ? t.loginTitle
      : mode === "register"
        ? t.registerTitle
        : t.forgotTitle;

  const actionText =
    mode === "login"
      ? t.loginAction
      : mode === "register"
        ? t.registerAction
        : t.forgotAction;

  const toggleText =
    mode === "login"
      ? t.createAccount
      : t.haveAccount;

  function getAuthErrorMessage(error: unknown) {
    if (!(error instanceof Error)) {
      return t.genericError;
    }

    const message =
      error.message.toLowerCase();

    if (
      message.includes("invalid") ||
      message.includes("incorrect")
    ) {
      return t.invalidError;
    }

    if (
      message.includes("already") ||
      message.includes("registered")
    ) {
      return t.registeredError;
    }

    if (
      message.includes("verify") ||
      message.includes("verified")
    ) {
      return t.unverifiedError;
    }

    return error.message || t.genericError;
  }

  async function submit() {
    setLocalError(null);
    setNotice(null);

    const submittedEmail =
      email.trim().toLowerCase();

    try {
      const payload = {
        email: submittedEmail,
        password,
      };

      if (mode === "login") {
        await login(payload);
        router.replace("/habits" as never);
        return;
      }

      if (mode === "register") {
        await register(payload);
        setVerificationEmail(payload.email);
        setPassword("");
        setNotice(t.verificationSent);
        return;
      }

      await forgotPassword({
        email: payload.email,
      });
      setNotice(t.forgotSent);
    } catch (error) {
      if (mode === "login" && error instanceof Error) {
        const message = error.message.toLowerCase();

        if (
          message.includes("verify") ||
          message.includes("verified")
        ) {
          setVerificationEmail(submittedEmail);
        }
      }

      setLocalError(
        getAuthErrorMessage(error)
      );
    }
  }

  async function handleResendVerification() {
    const targetEmail =
      verificationEmail || email.trim().toLowerCase();

    if (!targetEmail) {
      return;
    }

    setLocalError(null);
    setNotice(null);

    try {
      await resendVerification({
        email: targetEmail,
      });
      setNotice(t.resendSent);
    } catch (error) {
      setLocalError(
        getAuthErrorMessage(error)
      );
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setLocalError(null);
    setNotice(null);
  }

  return (
    <SafeAreaView style={styles.container}>
      <CovenantBackdrop intensity="strong" variant="habit" />

      <LinearGradient
        colors={[
          "rgba(0,0,0,0.08)",
          "rgba(0,0,0,0.58)",
          "rgba(0,0,0,0.96)",
        ]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          styles.aura,
          {
            opacity: pulse,
          },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fade,
              transform: [{ translateY: rise }],
            },
          ]}
        >
          <Text style={styles.kicker}>{t.kicker}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {t.subtitle}
          </Text>

          <BlurView intensity={24} tint="dark" style={styles.panel}>
            <View style={styles.toggle}>
              <Pressable
                onPress={() => switchMode("login")}
                style={[
                  styles.toggleSide,
                  mode === "login" && styles.toggleActive,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    mode === "login" && styles.toggleTextActive,
                  ]}
                >
                  {t.loginTab}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => switchMode("register")}
                style={[
                  styles.toggleSide,
                  mode === "register" && styles.toggleActive,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    mode === "register" && styles.toggleTextActive,
                  ]}
                >
                  {t.registerTab}
                </Text>
              </Pressable>
            </View>

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder={t.emailPlaceholder}
              placeholderTextColor="rgba(255,255,255,0.32)"
              style={styles.input}
              value={email}
            />

            {mode !== "forgot" ? (
              <TextInput
                autoCapitalize="none"
                onChangeText={setPassword}
                placeholder={t.passwordPlaceholder}
                placeholderTextColor="rgba(255,255,255,0.32)"
                secureTextEntry
                style={styles.input}
                value={password}
              />
            ) : null}

            {localError ? (
              <Text style={styles.error}>{localError}</Text>
            ) : null}

            {notice ? (
              <Text style={styles.notice}>{notice}</Text>
            ) : null}

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
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFD1A0" />
                  <Text style={styles.buttonText}>{t.loading}</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>{actionText}</Text>
              )}
            </Pressable>

            {verificationEmail ? (
              <Pressable
                disabled={busy}
                onPress={handleResendVerification}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryText}>
                  {t.resendVerification}
                </Text>
              </Pressable>
            ) : null}

            {mode === "login" ? (
              <Pressable
                disabled={busy}
                onPress={() => switchMode("forgot")}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryText}>
                  {t.forgotPassword}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              disabled={busy}
              onPress={() =>
                switchMode(mode === "login" ? "register" : "login")
              }
              style={styles.switchButton}
            >
              <Text style={styles.switchText}>
                {mode === "forgot" ? t.backToLogin : toggleText}
              </Text>
            </Pressable>
          </BlurView>
        </Animated.View>
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

  aura: {
    position: "absolute",
    top: 88,
    alignSelf: "center",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(216,140,58,0.16)",
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 70,
    shadowOffset: {
      width: 0,
      height: 0,
    },
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
    marginBottom: 18,
    textAlign: "center",
  },

  subtitle: {
    color: "#D8C2AA",
    fontSize: 16,
    lineHeight: 26,
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

  toggle: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(216,140,58,0.22)",
    marginBottom: 18,
    overflow: "hidden",
  },

  toggleSide: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  toggleActive: {
    backgroundColor: "rgba(216,140,58,0.18)",
  },

  toggleText: {
    color: "rgba(255,255,255,0.46)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
  },

  toggleTextActive: {
    color: "#FFD1A0",
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

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  buttonText: {
    color: "#FFD1A0",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 4,
  },

  secondaryButton: {
    alignItems: "center",
    paddingTop: 16,
  },

  secondaryText: {
    color: "#D8C2AA",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2.4,
    textAlign: "center",
  },

  switchButton: {
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 4,
  },

  switchText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
  },
});
