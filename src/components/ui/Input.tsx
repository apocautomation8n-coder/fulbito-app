import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  TextInput,
  StyleSheet,
  Text,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '../../theme/designSystem';

type InputVariant = 'default' | 'glass' | 'outline';
type AutofillMode = 'none' | 'email' | 'password' | 'newPassword' | 'name' | 'tel';

type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  variant?: InputVariant;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  /** Desactiva autocompletar del celular (fondo amarillo que bloquea escritura). */
  autofillMode?: AutofillMode;
  style?: StyleProp<ViewStyle>;
};

const getAutofillProps = (mode: AutofillMode): Partial<TextInputProps> => {
  switch (mode) {
    case 'email':
      return {
        autoComplete: 'email',
        textContentType: 'emailAddress',
        importantForAutofill: 'yes',
      };
    case 'password':
      return {
        autoComplete: 'password',
        textContentType: 'password',
        importantForAutofill: 'yes',
      };
    case 'newPassword':
      return {
        autoComplete: 'password-new',
        textContentType: 'newPassword',
        importantForAutofill: 'yes',
      };
    case 'name':
      return {
        autoComplete: 'name',
        textContentType: 'name',
        importantForAutofill: 'yes',
      };
    case 'tel':
      return {
        autoComplete: 'tel',
        textContentType: 'telephoneNumber',
        keyboardType: 'phone-pad',
        importantForAutofill: 'yes',
      };
    case 'none':
    default:
      return {
        autoComplete: 'off',
        textContentType: 'none',
        importantForAutofill: 'no',
        autoCorrect: false,
        spellCheck: false,
      };
  }
};

const resolveAutofillMode = (
  explicit: AutofillMode | undefined,
  secureTextEntry: boolean | undefined,
  keyboardType: TextInputProps['keyboardType'],
): AutofillMode => {
  if (explicit) return explicit;
  if (secureTextEntry) return 'password';
  if (keyboardType === 'email-address') return 'email';
  if (keyboardType === 'phone-pad') return 'tel';
  return 'none';
};

export function Input({
  label,
  variant = 'default',
  error,
  success = false,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  autofillMode,
  style,
  onFocus,
  onBlur,
  secureTextEntry,
  keyboardType,
  autoCorrect,
  spellCheck,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const canTogglePassword = showPasswordToggle && Boolean(secureTextEntry);
  const resolvedAutofill = resolveAutofillMode(autofillMode, secureTextEntry, keyboardType);
  const autofillProps = getAutofillProps(resolvedAutofill);

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
      <View style={containerStyle} pointerEvents="box-none">
        {leftIcon ? <View style={styles.iconLeft} pointerEvents="none">{leftIcon}</View> : null}
        <TextInput
          editable={props.editable !== false}
          keyboardType={keyboardType}
          style={[styles.input, Platform.OS === 'web' ? styles.inputWeb : null]}
          placeholderTextColor={colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={canTogglePassword ? !isPasswordVisible : secureTextEntry}
          underlineColorAndroid="transparent"
          autoCorrect={autoCorrect ?? autofillProps.autoCorrect}
          spellCheck={spellCheck ?? autofillProps.spellCheck}
          {...autofillProps}
          {...props}
        />
        {canTogglePassword ? (
          <Pressable
            accessibilityLabel={isPasswordVisible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
            hitSlop={8}
            onPress={() => setIsPasswordVisible((current) => !current)}
            style={styles.iconRight}
          >
            {isPasswordVisible ? (
              <EyeOff size={18} color={colors.textTertiary} />
            ) : (
              <Eye size={18} color={colors.textTertiary} />
            )}
          </Pressable>
        ) : null}
        {rightIcon && !canTogglePassword ? <View style={styles.iconRight}>{rightIcon}</View> : null}
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
    alignSelf: 'stretch',
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: Platform.OS === 'android' ? 10 : spacing.sm,
    minHeight: Platform.OS === 'android' ? 40 : 24,
    width: '100%',
  },
  inputWeb: {
    outlineWidth: 0,
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

