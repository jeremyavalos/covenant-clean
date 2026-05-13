export default {
  expo: {
    name: "covenant-clean",
    slug: "covenant-clean",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "covenantclean",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      covenantApiUrl: "https://covenant-clean-production.up.railway.app",
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
      revenueCatIosApiKey:
        process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || "ios api key",
      revenueCatAndroidApiKey:
        process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ||
        "android api key",
    },
  },
};
