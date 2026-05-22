import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal as RNModal,
  type ModalProps as RNModalProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme/designSystem';

const AnimatedView = Animated.createAnimatedComponent(View);

type ModalProps = Omit<RNModalProps, 'style'> & {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Modal({
  visible,
  onClose,
  title,
  children,
  style,
  contentStyle,
  ...props
}: ModalProps) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      opacity.value = withSpring(1, { damping: 15, stiffness: 400 });
    } else {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
      opacity.value = withSpring(0, { damping: 15, stiffness: 400 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      {...props}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <AnimatedView
          style={[styles.container, animatedStyle, style]}
          onStartShouldSetResponder={() => true}
        >
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
            </View>
          )}
          <View style={[styles.content, contentStyle]}>{children}</View>
        </AnimatedView>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    width: '100%',
    maxWidth: 400,
    ...shadows.xl,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
  },
});
