import PostHog from "posthog-react-native";
import Constants from "expo-constants";

// Configuration loaded from app.config.js extras via expo-constants
// Environment variables are read at build time in app.config.js
const apiKey = Constants.expoConfig?.extra?.posthogProjectToken as
  | string
  | undefined;
const host = Constants.expoConfig?.extra?.posthogHost as string | undefined;
const isPostHogConfigured =
  apiKey && apiKey !== "phc_your_project_token_here";

if (__DEV__ && !isPostHogConfigured) {
  console.warn(
    "PostHog project token not configured. Analytics will be disabled. " +
      "Set POSTHOG_PROJECT_TOKEN in your .env file to enable analytics."
  );
}

export const posthog = new PostHog(apiKey || "placeholder_key", {
  host,

  // Disable PostHog if project token is not configured
  disabled: !isPostHogConfigured,

  // Capture app lifecycle events
  captureAppLifecycleEvents: true,

  // Batching settings for battery efficiency
  flushAt: 20,
  flushInterval: 10000,
  maxBatchSize: 100,
  maxQueueSize: 1000,

  // Feature flags
  preloadFeatureFlags: false,
  sendFeatureFlagEvent: true,
  featureFlagsRequestTimeoutMs: 10000,

  // Network settings
  requestTimeout: 10000,
  fetchRetryCount: 3,
  fetchRetryDelay: 3000,
});

export const isPostHogEnabled = isPostHogConfigured;
