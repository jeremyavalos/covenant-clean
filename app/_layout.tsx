import {
  Stack,
  useRouter,
  useSegments,
} from "expo-router";

import {
  useEffect,
} from "react";

import {
  ActivityIndicator,
  View,
} from "react-native";

import {
  initializeRevenueCat,
} from "../utils/revenuecat";

import {
  syncProgress,
} from "../utils/progress";

import {
  useAuthStore,
} from "../store/authStore";

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();

  const token = useAuthStore(
    (state) => state.token
  );

  const loading = useAuthStore(
    (state) => state.loading
  );

  const initializeAuth = useAuthStore(
    (state) => state.initializeAuth
  );

  useEffect(() => {

    initializeRevenueCat();
    initializeAuth();

  }, [initializeAuth]);

  useEffect(() => {
    if (loading) {
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

    if (!token && !isPublicRoute) {
      router.replace("/auth" as never);
      return;
    }

    if (token && currentRoute === "auth") {
      router.replace("/habits");
    }
  }, [loading, router, segments, token]);

  useEffect(() => {
    if (!loading && token) {
      syncProgress().catch((error) => {
        console.warn(
          "[Covenant progress] Startup sync failed.",
          error
        );
      });
    }
  }, [loading, token]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050505",
        }}
      >
        <ActivityIndicator color="#D88C3A" />
      </View>
    );
  }

  return (

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

  );

}
