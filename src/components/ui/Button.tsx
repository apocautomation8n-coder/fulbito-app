import React from 'react';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../../theme/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'glow';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  loading?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  style,
  fullWidth = false,
  disabled = false,
  loading = false,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = (e: any) => {
    if (disabled || loading) return;
    scale.value = withSpring(0.97, { damping: 20, stiffness: 450 });
    opacity.value = withSpring(0.9, { damping: 20, stiffness: 450 });
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (disabled || loading) return;
    scale.value = withSpring(1, { damping: 20, stiffness: 450 });
    opacity.value = withSpring(1, { damping: 20, stiffness: 450 });
    onPressOut?.(e);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <View style={styles.spinner} />
          <Text style={[styles.label, styles.txtPrimary, styles.loadingLabel]}>{label}</Text>
        </View>
      );
    }

    const textStyleKey = `txt${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles;
    const variantTextStyle = styles[textStyleKey] || styles.txtPrimary;

    return (
      <>
        {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
        <Text style={[styles.label, variantTextStyle]}>{label}</Text>
        {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
      </>
    );
  };

  const btnStyleKey = `btn${variant.charAt(0).toUpperCase() + variant.slice(1)}` as keyof typeof styles;
  const variantBtnStyle = styles[btnStyleKey] || styles.btnPrimary;

  const buttonStyle = [
    styles.base,
    variantBtnStyle,
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    animatedStyle,
    style,
  ];

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={buttonStyle}
      {...props}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  // Sizes
  sm: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  md: {
    minHeight: 46,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  lg: {
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  xl: {
    minHeight: 60,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.xl,
  },
  fullWidth: {
    width: '100%',
  },
  // Button layout styles
  btnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.md,
  },
  btnSecondary: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    ...shadows.sm,
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  btnDanger: {
    backgroundColor: 'transparent',
    borderColor: colors.danger,
  },
  btnAccent: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    ...shadows.md,
  },
  btnGlow: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.md,
  },
  // States
  disabled: {
    opacity: 0.4,
  },
  // Label font base
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  // Button label color styles
  txtPrimary: {
    color: colors.background,
  },
  txtSecondary: {
    color: colors.textPrimary,
  },
  txtGhost: {
    color: colors.textPrimary,
  },
  txtDanger: {
    color: colors.danger,
  },
  txtAccent: {
    color: colors.background,
  },
  txtGlow: {
    color: colors.background,
  },
  loadingLabel: {
    color: colors.background,
  },
  // Icons
  iconLeft: {
    marginRight: spacing.xs,
  },
  iconRight: {
    marginLeft: spacing.xs,
  },
  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.background,
    borderTopColor: 'transparent',
  },
});

