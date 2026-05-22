import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../theme/designSystem';

type InputVariant = 'default' | 'glass' | 'outline';
type InputState = 'default' | 'focus' | 'error' | 'success';

type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  variant?: InputVariant;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Input({
  label,
  variant = 'default',
  error,
  success = false,
  leftIcon,
  rightIcon,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getStateColor = () => {
    if (error) return colors.danger;
    if (success) return colors.success;
    if (isFocused) return colors.primary;
    return colors.border;
  };

  const containerStyle = [
    styles.inputContainer,
    styles[variant],
    { borderColor: getStateColor() },
  ];

  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={containerStyle}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    backgroundColor: colors.card,
  },
  default: {
    backgroundColor: colors.card,
  },
  glass: {
    backgroundColor: colors.cardLight,
  },
  outline: {
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
    height: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

