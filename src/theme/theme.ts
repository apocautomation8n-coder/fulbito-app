import { colors as dsColors, spacing as dsSpacing, borderRadius as dsRadius } from './designSystem';

export const colors = {
  background: dsColors.background,
  surface: dsColors.backgroundSecondary,
  surfaceMuted: dsColors.card,
  ink: dsColors.textPrimary,
  muted: dsColors.textSecondary,
  primary: dsColors.primary,
  primaryDark: dsColors.primaryDark,
  accent: dsColors.accent,
  coral: '#FFC857', // Mapped to warning/coral color
  border: dsColors.border,
  danger: dsColors.danger,
  success: dsColors.success,
};

export const spacing = {
  xs: dsSpacing.xs,
  sm: dsSpacing.sm,
  md: dsSpacing.md,
  lg: dsSpacing.lg,
  xl: dsSpacing.xl,
  xxl: dsSpacing['2xl'],
};

export const radius = {
  sm: dsRadius.sm,
  md: dsRadius.md,
};

export const typography = {
  title: 28,
  h1: 24,
  h2: 20,
  body: 14,
  small: 12,
  tiny: 11,
};

