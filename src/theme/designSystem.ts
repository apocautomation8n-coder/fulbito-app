/**
 * Fulbito Premium Design System - Modern Light Mode First
 * High readability, high performance, real mobile app aesthetics
 */

// Colors - Premium Light Theme
export const colors = {
  // Primary Green (Used as accent and buttons - lively & sporty emerald)
  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: '#D1FAE5',
  
  // Backgrounds
  background: '#F8FAFC',          // Light Slate
  backgroundSecondary: '#FFFFFF', // Pure White Surface
  card: '#FFFFFF',                // Card background
  cardLight: '#F1F5F9',           // Subtle inner element background
  
  // Accent
  accent: '#10B981',
  accentDim: '#059669',
  
  // Text
  textPrimary: '#0F172A',         // Slate 900 (High contrast)
  textSecondary: '#475569',       // Slate 600
  textTertiary: '#64748B',        // Slate 500
  textDisabled: '#94A3B8',        // Slate 400
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  
  // Border (Clean, high-visibility hairline borders)
  border: '#E2E8F0',              // Slate 200
  glassBorder: '#E2E8F0',
  
  // Clean overlays
  glass: 'rgba(255, 255, 255, 0.95)',
  glassLight: 'rgba(248, 250, 252, 0.90)',
  
  // Shadows (Soft, modern, light elevation shadows)
  shadow: '#0F172A',
  shadowLight: '#64748B',
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
  
  // Letter Spacing (Numbers only for React Native compatibility)
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.3,
  },
};

// Spacing Scale
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

// Border Radius
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
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// Animation Durations
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

// Glassmorphism Styles (For Light Mode)
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

// Gradient Presets
export const gradients = {
  primary: [colors.primary, colors.primaryDark],
  accent: [colors.accent, colors.accentDim],
  dark: [colors.backgroundSecondary, colors.background],
  glow: [colors.backgroundSecondary, colors.backgroundSecondary],
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
