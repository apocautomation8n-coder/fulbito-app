/**
 * Fulbito Premium Design System - Clean & Sporty Dark Mode First
 * High readability, high performance, real mobile app aesthetics
 */

// Colors - Dark Theme
export const colors = {
  // Primary Green (Used as accent only, not to paint the whole app)
  primary: '#65F36A',
  primaryDark: '#4CD651',
  primaryLight: '#82FF86',
  
  // Dark Backgrounds
  background: '#0B0F0C',
  backgroundSecondary: '#121815', // Surface
  card: '#171F1B',
  cardLight: '#222D27',
  
  // Accent
  accent: '#65F36A',
  accentDim: '#4CD651',
  
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A9B5AC',
  textTertiary: '#738378',
  textDisabled: '#46534B',
  
  // Status
  success: '#65F36A',
  warning: '#FFC857',
  danger: '#FF5252',
  info: '#4EA8DE',
  
  // Border (Real mobile app hairline borders)
  border: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.06)', // Fallback
  
  // Clean overlays (minimal glassmorphism, opaque and fast to render)
  glass: 'rgba(18, 24, 21, 0.95)',
  glassLight: 'rgba(23, 31, 27, 0.90)',
  
  // Shadows (Soft, performance friendly)
  shadow: 'rgba(0, 0, 0, 0.5)',
  shadowLight: 'rgba(0, 0, 0, 0.25)',
};

// Typography Scale (Inter Font Only)
export const typography = {
  // Font Families (Inter only for all text elements)
  fontFamily: {
    primary: 'Inter',
    display: 'Inter',
    mono: 'Inter',
  },
  
  // Font Sizes
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.3,
  },
};

// Spacing Scale (Airy and consistent spacing)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};

// Border Radius (Clean, sports-app rounded corners)
export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  // Remove neon glow - use clean soft shadow fallback
  glow: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// Animation Durations (Fast transitions for snappier native feel)
export const animation = {
  fast: 100,
  normal: 200,
  slow: 350,
  slower: 500,
};

// Z-Index Scale
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// Breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// Glassmorphism Styles (Simplified to fast-rendering opaque surface containers)
export const glassmorphism = {
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  light: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
};

// Gradient Presets (Removed neon gradients, keeping subtle shadows/darks)
export const gradients = {
  primary: [colors.primary, colors.primaryDark],
  accent: [colors.accent, colors.accentDim],
  dark: [colors.backgroundSecondary, colors.background],
  glow: [colors.backgroundSecondary, colors.backgroundSecondary], // Fallback to flat background
};

// Transition Presets
export const transitions = {
  fast: { duration: animation.fast },
  normal: { duration: animation.normal },
  slow: { duration: animation.slow },
  spring: {
    type: 'spring',
    damping: 20,
    stiffness: 300,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  zIndex,
  breakpoints,
  glassmorphism,
  gradients,
  transitions,
};

