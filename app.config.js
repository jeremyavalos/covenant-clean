export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
    posthogHost: process.env.POSTHOG_HOST,
    revenueCatIosApiKey:
      process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || "ios api key",
    revenueCatAndroidApiKey:
      process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || "android api key",
  },
});
