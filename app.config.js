module.exports = {
  name: "Grade Edu AI",
  slug: "grade-edu-ai",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#3B82F6"
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.gradeeduai.app"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#3B82F6"
    },
    package: "com.gradeeduai.app"
  },
  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/images/favicon.png"
  },
  plugins: ["expo-router", "expo-font", "expo-web-browser", "expo-document-picker", "expo-image-picker"],
  experiments: {
    typedRoutes: true
  },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.example.com",
    assemblyAiApiKey: process.env.EXPO_PUBLIC_ASSEMBLY_AI_API_KEY || "0f178296edb341d89f621c224c21201b"
  }
};