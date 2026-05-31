import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CovenantBackdrop from "../components/CovenantBackdrop";
import {
  PRIVACY_POLICY_URL,
  SUPPORT_URL,
  TERMS_OF_USE_URL,
} from "../constants/legal";
import { colors } from "../constants/theme";
import { useAuthStore } from "../store/authStore";
import { getLanguage, Language } from "../utils/language";

type AuthMode = "login" | "register" | "forgot";

const RESEND_COOLDOWN_SECONDS = 15;

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
  const [resendCooldown, setResendCooldown] = useState(0);

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

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

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
          checkEmailTitle: "Revisa tu correo.",
          checkEmailBody:
            "Para entrar a Covenant, abre el enlace de verificación que enviamos a tu email. Si tarda, revisa spam o reenvíalo aquí.",
          loading: "ABRIENDO",
          genericError: "No se pudo abrir la sesión.",
          invalidError: "Email o contraseña incorrectos.",
          registeredError: "Ese email ya está registrado.",
          unverifiedError: "Verifica tu correo antes de entrar.",
          emailSendError:
            "No pudimos enviar el correo de verificación. Intenta reenviarlo en un momento.",
          verificationSent:
            "Te enviamos un correo de verificación. Revisa tu bandeja de entrada y correo no deseado.",
          resendVerification: "REENVIAR CORREO DE VERIFICACIÓN",
          resendCountdown: "REENVIAR EN",
          resendSent:
            "Te enviamos otro correo de verificación.",
          forgotSent:
            "Si este correo existe, enviamos instrucciones para restablecer tu contraseña.",
          privacy: "Privacidad",
          terms: "Términos",
          support: "Soporte",
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
          checkEmailTitle: "Check your email.",
          checkEmailBody:
            "To enter Covenant, open the verification link we sent to your email. If it takes a moment, check spam or resend it here.",
          loading: "OPENING",
          genericError: "Could not open the session.",
          invalidError: "Invalid email or password.",
          registeredError: "That email is already registered.",
          unverifiedError: "Please verify your email before entering.",
          emailSendError:
            "We could not send the verification email. Please try resending it in a moment.",
          verificationSent:
            "We sent you a verification email. Check your inbox and spam folder.",
          resendVerification: "RESEND VERIFICATION EMAIL",
          resendCountdown: "RESEND IN",
          resendSent:
            "We sent another verification email.",
          forgotSent:
            "If this email exists, we sent password reset instructions.",
          privacy: "Privacy",
          terms: "Terms",
          support: "Support",
        };

  const showingVerification = Boolean(verificationEmail);

  const title =
    showingVerification
      ? t.checkEmailTitle
      : mode === "login"
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

  const resendText =
    resendCooldown > 0
      ? `${t.resendCountdown} ${resendCooldown}s`
      : t.resendVerification;

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

    if (
      message.includes("verification email") ||
      message.includes("send verification")
    ) {
      return t.emailSendError;
    }

    return t.genericError;
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
        language,
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
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        return;
      }

      await forgotPassword({
        email: payload.email,
        language,
      });
      setNotice(t.forgotSent);
    } catch (error) {
      if (
        (mode === "login" || mode === "register") &&
        error instanceof Error
      ) {
        const message = error.message.toLowerCase();

        if (
          message.includes("verify") ||
          message.includes("verified") ||
          message.includes("verification email")
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

    if (resendCooldown > 0) {
      return;
    }

    setLocalError(null);
    setNotice(null);

    try {
      await resendVerification({
        email: targetEmail,
        language,
      });
      setNotice(t.resendSent);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
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
    setVerificationEmail(null);
    setResendCooldown(0);
  }

  function openLegalUrl(url: string) {
    Linking.openURL(url).catch(() => undefined);
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
            {showingVerification ? (
              <>
                <Text style={styles.checkEmailBody}>
                  {t.checkEmailBody}
                </Text>

                {localError ? (
                  <Text style={styles.error}>{localError}</Text>
                ) : null}

                {notice ? (
                  <Text style={styles.notice}>{notice}</Text>
                ) : null}

                <Pressable
                  disabled={busy || resendCooldown > 0}
                  onPress={handleResendVerification}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    (busy || resendCooldown > 0) && styles.buttonBusy,
                  ]}
                >
                  {busy ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color="#FFD1A0" />
                      <Text style={styles.buttonText}>{t.loading}</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>{resendText}</Text>
                  )}
                </Pressable>

                <Pressable
                  disabled={busy}
                  onPress={() => switchMode("login")}
                  style={styles.switchButton}
                >
                  <Text style={styles.switchText}>{t.backToLogin}</Text>
                </Pressable>
              </>
            ) : (
              <>
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
              </>
            )}

            <View style={styles.legalLinks}>
              <Pressable onPress={() => openLegalUrl(PRIVACY_POLICY_URL)}>
                <Text style={styles.legalLink}>{t.privacy}</Text>
              </Pressable>
              <Text style={styles.legalSeparator}>/</Text>
              <Pressable onPress={() => openLegalUrl(TERMS_OF_USE_URL)}>
                <Text style={styles.legalLink}>{t.terms}</Text>
              </Pressable>
              <Text style={styles.legalSeparator}>/</Text>
              <Pressable onPress={() => openLegalUrl(SUPPORT_URL)}>
                <Text style={styles.legalLink}>{t.support}</Text>
              </Pressable>
            </View>
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
    backgroundColor: "rgba(216,140,58,0.08)",
    shadowColor: colors.accent,
    shadowOpacity: 0.22,
    shadowRadius: 44,
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
    borderColor: "rgba(216,140,58,0.24)",
    backgroundColor: "rgba(6,6,6,0.66)",
    padding: 18,
  },

  toggle: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(216,140,58,0.18)",
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
    backgroundColor: "rgba(216,140,58,0.13)",
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

  checkEmailBody: {
    color: "#D8C2AA",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 18,
    textAlign: "center",
  },

  button: {
    minHeight: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(216,110,34,0.18)",
    borderWidth: 1,
    borderColor: "rgba(216,140,58,0.48)",
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

  legalLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    paddingTop: 18,
  },

  legalLink: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 11,
    letterSpacing: 1.2,
  },

  legalSeparator: {
    color: "rgba(255,255,255,0.24)",
    fontSize: 11,
  },
});
