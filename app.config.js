const PLACEHOLDERS = new Set(["ios api key", "android api key"]);

function cleanConfigValue(value) {
  return value && !PLACEHOLDERS.has(value) ? value : undefined;
}

export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
    posthogHost: process.env.POSTHOG_HOST,
    revenueCatIosApiKey: cleanConfigValue(
      process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ||
        config.extra?.revenueCatIosApiKey
    ),
    revenueCatAndroidApiKey: cleanConfigValue(
      process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ||
        config.extra?.revenueCatAndroidApiKey
    ),
  },
});
