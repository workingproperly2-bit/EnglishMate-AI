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