/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#17243A',
    tint: '#3E8ED0',

    // Core surfaces
    background: '#F7F5EF',
    foreground: '#17243A',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#17243A',

    // Primary action color (buttons, links, active states)
    primary: '#3E8ED0',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E7F1F8',
    secondaryForeground: '#17243A',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EEF1F2',
    mutedForeground: '#687688',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#FFF1C7',
    accentForeground: '#6B4D00',

    // Destructive actions (delete, error states)
    destructive: '#D9655A',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#DDE4E6',
    input: '#DDE4E6',
    navy: '#17243A',
    sky: '#3E8ED0',
    gold: '#F5C85B',
    mint: '#DDF2E9',
    coral: '#F4A08F',
    success: '#378C70',
  },

  dark: {
    text: '#F6F7F4',
    tint: '#73B7EA',
    background: '#101A2B',
    foreground: '#F6F7F4',
    card: '#18263B',
    cardForeground: '#F6F7F4',
    primary: '#73B7EA',
    primaryForeground: '#102039',
    secondary: '#20354D',
    secondaryForeground: '#F6F7F4',
    muted: '#203044',
    mutedForeground: '#A9B7C6',
    accent: '#4A3D20',
    accentForeground: '#FFE9A5',
    destructive: '#F08E83',
    destructiveForeground: '#24110F',
    border: '#2A3C50',
    input: '#2A3C50',
    navy: '#F6F7F4',
    sky: '#73B7EA',
    gold: '#F5C85B',
    mint: '#244337',
    coral: '#E88C7B',
    success: '#72C5A5',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 18,
};

export default colors;
