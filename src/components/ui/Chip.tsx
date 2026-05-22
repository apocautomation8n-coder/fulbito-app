import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../theme/designSystem';

type ChipVariant = 'default' | 'primary' | 'accent' | 'outline' | 'glass';
type ChipSize = 'sm' | 'md' | 'lg';

type ChipProps = {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  selected?: boolean;
  onSelect?: () => void;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
};

export function Chip({
  label,
  variant = 'default',
  size = 'md',
  selected = false,
  onSelect,
  style,
  icon,
}: ChipProps) {
  const effectiveVariant = selected ? 'primary' : variant;

  const getLabelColor = () => {
    if (selected || effectiveVariant === 'primary' || effectiveVariant === 'accent') return colors.background;
    if (effectiveVariant === 'outline') return colors.textSecondary;
    return colors.textPrimary;
  };

  const sizeStyle = styles[size];
  const variantStyle = styles[effectiveVariant];

  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        sizeStyle,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.label, styles[`label${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles], { color: getLabelColor() }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  sm: {
    borderRadius: borderRadius.sm,
  },
  md: {
    borderRadius: borderRadius.md,
  },
  lg: {
    borderRadius: borderRadius.lg,
  },
  default: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  accent: {
    backgroundColor: colors.accent,
    borderColor: colors.accentDim,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  glass: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  labelSm: {
    fontSize: 11,
  },
  labelMd: {
    fontSize: 13,
  },
  labelLg: {
    fontSize: 15,
  },
  icon: {
    marginRight: spacing.xs,
  },
});

