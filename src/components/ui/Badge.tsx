import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  type ViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../theme/designSystem';

type BadgeVariant = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'glow';
type BadgeSize = 'sm' | 'md' | 'lg';

type BadgeProps = Omit<ViewProps, 'style'> & {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
};

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  style,
  icon,
}: BadgeProps) {
  const getLabelColor = () => {
    switch (variant) {
      case 'primary':
      case 'accent':
      case 'success':
      case 'danger':
        return { color: colors.background };
      case 'warning':
        return { color: '#FFFFFF' };
      case 'glow':
        return { color: colors.primary };
      case 'default':
      default:
        return { color: colors.textPrimary };
    }
  };

  const getLabelStyle = () => {
    return size === 'sm' ? styles.labelSm : size === 'md' ? styles.labelMd : styles.labelLg;
  };

  return (
    <View style={[styles.base, styles[variant], styles[size], style]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.label, getLabelColor(), getLabelStyle()]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  sm: {
    borderRadius: borderRadius.md,
  },
  md: {
    borderRadius: borderRadius.lg,
  },
  lg: {
    borderRadius: borderRadius.xl,
  },
  default: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  accent: {
    backgroundColor: colors.accent,
  },
  success: {
    backgroundColor: colors.success,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  glow: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelSm: {
    fontSize: 10,
  },
  labelMd: {
    fontSize: 12,
  },
  labelLg: {
    fontSize: 14,
  },
  icon: {
    marginRight: spacing.xs,
  },
});
