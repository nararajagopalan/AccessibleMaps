import appConfig from "../../app.json";
import developerConfig from "../../developer.config.json";

export const config = {
  google: {
    mapsApiKey: developerConfig.google.mapsApiKey,
  },
  firebase: developerConfig.firebase,
  app: {
    name: appConfig.expo.name,
    version: appConfig.expo.version,
    ios: appConfig.expo.ios,
    android: appConfig.expo.android,
  },
  ui: {
    icon: appConfig.expo.icon,
    splash: appConfig.expo.splash,
  },
};

// Export specific configs that are commonly used
export const GOOGLE_MAPS_API_KEY = config.google.mapsApiKey;
export const FIREBASE_CONFIG = config.firebase;
