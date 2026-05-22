import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  type ViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { colors, spacing, borderRadius, shadows } from '../../theme/designSystem';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type BottomSheetProps = ViewProps & {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  snapPoints?: number[];
};

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  style,
  snapPoints = [0.9],
  ...props
}: BottomSheetProps) {
  const translateY = useSharedValue(1000);
  const backdropOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 400 });
      backdropOpacity.value = withSpring(1, { damping: 15, stiffness: 400 });
    } else {
      translateY.value = withSpring(1000, { damping: 15, stiffness: 400 });
      backdropOpacity.value = withSpring(0, { damping: 15, stiffness: 400 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100) {
        translateY.value = withSpring(1000, { damping: 15, stiffness: 400 }, () => {
          if (onClose) {
            runOnJS(onClose)();
          }
        });
      } else {
        translateY.value = withSpring(0, { damping: 15, stiffness: 400 });
      }
    });

  if (!visible) return null;

  return (
    <AnimatedView style={[StyleSheet.absoluteFill, styles.backdrop, backdropAnimatedStyle]}>
      <AnimatedPressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <View />
      </AnimatedPressable>
      <GestureDetector gesture={gesture}>
        <AnimatedView style={[styles.container, animatedStyle, style]} {...props}>
          <View style={styles.handle} />
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </AnimatedView>
      </GestureDetector>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    paddingBottom: spacing.xl,
    ...shadows.xl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.glassBorder,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
});
