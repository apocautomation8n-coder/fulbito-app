import React from 'react';
import type { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  type ViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme/designSystem';

type CardVariant = 'default' | 'glass' | 'elevated' | 'gradient' | 'outline';
type CardSize = 'sm' | 'md' | 'lg';

type CardProps = ViewProps & {
  children: ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  style?: StyleProp<ViewStyle>;
  noPadding?: boolean;
  onPress?: () => void;
};

export function Card({
  children,
  variant = 'default',
  size = 'md',
  style,
  noPadding = false,
  onPress,
  ...props
}: CardProps) {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[size],
    !noPadding && styles.padding,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          cardStyle,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.9,
  },
  // Sizes
  sm: {
    borderRadius: borderRadius.sm,
  },
  md: {
    borderRadius: borderRadius.md,
  },
  lg: {
    borderRadius: borderRadius.lg,
  },
  // Variants
  default: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    ...shadows.sm,
  },
  glass: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
    ...shadows.sm,
  },
  elevated: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    ...shadows.md,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  gradient: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    ...shadows.md,
  },
  // Padding
  padding: {
    padding: spacing.lg,
  },
});

