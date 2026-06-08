import {
  Stack,
  useRouter,
  useSegments,
  usePathname,
  useGlobalSearchParams,
  useRootNavigationState,
} from "expo-router";

import {
  useEffect,
  useRef,
} from "react";

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

import { PostHogProvider } from "posthog-react-native";

import {
  setProgressUser,
  syncProgress,
} from "../utils/progress";

import {
  GUEST_PROGRESS_USER_KEY,
  isGuestModeAvailable,
} from "../utils/guestMode";

import {
  useAuthStore,
} from "../store/authStore";

import { posthog } from "../config/posthog";

import {
  SubscriptionProvider,
} from "../context/SubscriptionContext";

import CovenantIntro from "../components/CovenantIntro";

import {
  useCovenantIntro,
} from "../hooks/useCovenantIntro";

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const rootNavigationState = useRootNavigationState();
  const previousPathname = useRef<string | undefined>(undefined);
  const previousToken = useRef<string | null>(null);
  const covenantIntro = useCovenantIntro();

  const token = useAuthStore(
    (state) => state.token
  );

  const user = useAuthStore(
    (state) => state.user
  );

  const loading = useAuthStore(
    (state) => state.loading
  );

  const initializeAuth = useAuthStore(
    (state) => state.initializeAuth
  );

  useEffect(() => {

    initializeAuth();

  }, [initializeAuth]);

  useEffect(() => {
    if (
      loading ||
      !rootNavigationState?.key
    ) {
      return;
    }

    const currentRoute =
      String(segments[0] ?? "");

    const isPublicRoute =
      !currentRoute ||
      currentRoute === "auth" ||
      currentRoute === "index" ||
      currentRoute === "language" ||
      currentRoute === "transition" ||
      currentRoute === "reset-password" ||
      currentRoute === "verify-email";

    const canUseGuestMode =
      isGuestModeAvailable();

    if (
      !token &&
      canUseGuestMode
    ) {
      setProgressUser(
        GUEST_PROGRESS_USER_KEY
      ).catch(() => undefined);
    }

    if (
      !token &&
      !canUseGuestMode &&
      !isPublicRoute
    ) {
      router.replace("/auth" as never);
      return;
    }

    if (
      token &&
      (
        currentRoute === "auth" ||
        currentRoute === "index"
      )
    ) {
      router.replace("/habits");
    }
  }, [loading, rootNavigationState?.key, router, segments, token]);

  useEffect(() => {
    if (!loading && token) {
      syncProgress().catch(() => undefined);
    }
  }, [loading, token]);

  // Identify user and track sign-in/sign-out via token changes
  useEffect(() => {
    if (loading) return;

    const hadToken = previousToken.current;
    previousToken.current = token;

    if (token && !hadToken && user) {
      // New login: identify by numeric user ID (no PII)
      try {
        posthog.identify(String(user.id), {
          $set: { is_pro: user.is_pro },
          $set_once: { first_seen_date: new Date().toISOString() },
        });
        posthog.capture("user_signed_in");
      } catch {
        // Analytics must never block navigation.
      }
    } else if (!token && hadToken) {
      // Logout
      try {
        posthog.capture("user_signed_out");
        posthog.reset();
      } catch {
        // Analytics must never block navigation.
      }
    }
  }, [loading, token, user]);

  // Manual screen tracking for Expo Router
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      try {
        posthog.screen(pathname, {
          previous_screen: previousPathname.current ?? null,
          ...params,
        });
      } catch {
        // Analytics must never block navigation.
      }

      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  return (

    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
        propsToCapture: ["testID"],
        maxElementsCaptured: 20,
      }}
    >

      <SubscriptionProvider>

        <Stack

          screenOptions={{

            headerShown: false,

            animation:
              "fade",

            animationDuration:
              700,

            contentStyle: {
              backgroundColor:
                "#050505",
            },

          }}

        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color="#D88C3A" />
          </View>
        )}

        {covenantIntro.visible && (
          <CovenantIntro
            mode={covenantIntro.mode}
            phrase={covenantIntro.phrase}
            onFinish={covenantIntro.completeIntro}
          />
        )}

      </SubscriptionProvider>

    </PostHogProvider>

  );

}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050505",
  },
});
