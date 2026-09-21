/**
 * Optional future AI service configuration.
 *
 * Set EXPO_PUBLIC_AI_API_URL and EXPO_PUBLIC_AI_API_KEY in the Expo
 * environment when a server-backed voice/writing service is ready. No
 * credential is stored in the app source and the app stays in demo mode
 * when these values are missing.
 */
export const AI_API_URL = process.env.EXPO_PUBLIC_AI_API_URL ?? '';
export const AI_API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY ?? '';
export const AI_DEMO_MODE = !AI_API_URL;

/**
 * Optional hosted Android APK URL.
 *
 * Set EXPO_PUBLIC_ANDROID_APK_URL after publishing a built APK to a file
 * host. The Downloads screen stays usable when this is empty.
 */
export const ANDROID_APK_URL = process.env.EXPO_PUBLIC_ANDROID_APK_URL ?? '';