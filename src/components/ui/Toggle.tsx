import React, { useEffect } from 'react';
import {
  StyleSheet,
  Pressable,
  View,
  type ViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../../theme/designSystem';

const AnimatedView = Animated.createAnimatedComponent(View);

type ToggleProps = Omit<ViewProps, 'style'> & {
  value: boolean;
  onValueChange: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
  size?: 'sm' | 'md' | 'lg';
};

export function Toggle({ value, onValueChange, style, size = 'md' }: ToggleProps) {
  const translateX = useSharedValue(value ? (size === 'sm' ? 16 : size === 'md' ? 20 : 24) : 0);

  useEffect(() => {
    const target = value ? (size === 'sm' ? 16 : size === 'md' ? 20 : 24) : 0;
    translateX.value = withSpring(target, { damping: 18, stiffness: 350 });
  }, [value, size]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleToggle = () => {
    onValueChange(!value);
  };

  const getThumbDimensions = () => {
    switch (size) {
      case 'sm': return { width: 18, height: 18, borderRadius: 9 };
      case 'lg': return { width: 26, height: 26, borderRadius: 13 };
      default: return { width: 22, height: 22, borderRadius: 11 };
    }
  };

  return (
    <Pressable
      onPress={handleToggle}
      style={[
        styles.base,
        styles[size],
        value ? styles.active : styles.inactive,
        style,
      ]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <AnimatedView style={[styles.thumb, getThumbDimensions(), thumbStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 2,
  },
  sm: {
    width: 38,
    height: 22,
    borderRadius: 11,
  },
  md: {
    width: 46,
    height: 26,
    borderRadius: 13,
  },
  lg: {
    width: 54,
    height: 30,
    borderRadius: 15,
  },
  inactive: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.border,
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  thumb: {
    backgroundColor: colors.background,
    ...shadows.sm,
  },
});

