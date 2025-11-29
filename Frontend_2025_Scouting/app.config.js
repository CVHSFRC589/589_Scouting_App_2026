// Load environment variables from .env file
require('dotenv').config();

module.exports = {
  expo: {
    name: "589-Scouting-App-2025",
    slug: "589-scouting-app-2025",
    version: "2.1.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.wsyrup.ReefscapeScoutingApp",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.wsyrup.ReefscapeScoutingApp"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font"
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "f1d2a8dc-5f31-4f8a-84ed-763fecb4a30e"
      },
      // Environment variables from .env file
      supabaseUrl: process.env.PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.PUBLIC_SUPABASE_KEY
    },
    owner: "wsyrup"
  }
};
