import React from 'react';
import { StyleSheet, View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, borderRadius } from '../../theme/designSystem';

const AnimatedView = Animated.createAnimatedComponent(View);

type SkeletonProps = ViewProps & {
  variant?: 'circle' | 'rect' | 'text';
  width?: number | string;
  height?: number | string;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ variant = 'rect', width, height, style, ...props }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const getVariantStyle = () => {
    const baseStyle: any = {};
    
    switch (variant) {
      case 'circle':
        baseStyle.borderRadius = 9999;
        baseStyle.width = width || 40;
        baseStyle.height = height || 40;
        break;
      case 'text':
        baseStyle.borderRadius = borderRadius.sm;
        baseStyle.width = width || '100%';
        baseStyle.height = height || 16;
        break;
      case 'rect':
      default:
        baseStyle.borderRadius = borderRadius.lg;
        baseStyle.width = width || '100%';
        baseStyle.height = height || 100;
    }
    
    return baseStyle;
  };

  return (
    <AnimatedView
      style={[
        styles.base,
        getVariantStyle(),
        animatedStyle,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.cardLight,
  },
});
