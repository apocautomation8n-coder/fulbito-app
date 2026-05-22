import React from 'react';
import { StyleSheet, Text, View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../../theme/designSystem';

const AnimatedView = Animated.createAnimatedComponent(View);

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

type ToastProps = ViewProps & {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function Toast({ message, variant = 'info', visible, onDismiss, style, ...props }: ToastProps) {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 350 });
      opacity.value = withSpring(1, { damping: 20, stiffness: 350 });
    } else {
      translateY.value = withSpring(100, { damping: 20, stiffness: 350 });
      opacity.value = withSpring(0, { damping: 20, stiffness: 350 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: colors.success, borderColor: colors.success };
      case 'error':
        return { backgroundColor: colors.danger, borderColor: colors.danger };
      case 'warning':
        return { backgroundColor: colors.warning, borderColor: colors.warning };
      case 'info':
      default:
        return { backgroundColor: colors.primary, borderColor: colors.primary };
    }
  };

  return (
    <AnimatedView
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.container,
        getVariantStyle(),
        animatedStyle,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.message, variant === 'success' || variant === 'info' ? styles.darkText : styles.lightText]}>{message}</Text>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    ...shadows.lg,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  darkText: {
    color: colors.background,
  },
  lightText: {
    color: colors.textPrimary,
  },
});

