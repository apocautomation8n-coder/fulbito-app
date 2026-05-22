import React from 'react';
import { StyleSheet, Text as RNText, TextProps as RNTextProps } from 'react-native';
import { typography, colors } from '../../theme/designSystem';

type TextProps = RNTextProps & {
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-lg' | 'body-sm' | 'caption' | 'label';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color?: keyof typeof colors;
  align?: 'left' | 'center' | 'right';
  uppercase?: boolean;
};

const fontWeights: Record<string, '300' | '400' | '500' | '600' | '700' | '800'> = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

const fontFamilies = {
  display: 'Inter',
  primary: 'Inter',
  mono: 'Inter',
};

const variantStyles: Record<string, any> = {
  display: {
    fontSize: typography.fontSize['4xl'], // 32
    fontWeight: '800' as const,
    fontFamily: fontFamilies.display,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h1: {
    fontSize: typography.fontSize['2xl'], // 24
    fontWeight: '800' as const,
    fontFamily: fontFamilies.display,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontSize: typography.fontSize.xl, // 20
    fontWeight: '700' as const,
    fontFamily: fontFamilies.display,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h3: {
    fontSize: typography.fontSize.lg, // 18
    fontWeight: '700' as const,
    fontFamily: fontFamilies.display,
    lineHeight: typography.lineHeight.tight,
  },
  h4: {
    fontSize: typography.fontSize.md, // 16
    fontWeight: '600' as const,
    fontFamily: fontFamilies.display,
    lineHeight: typography.lineHeight.tight,
  },
  h5: {
    fontSize: typography.fontSize.base, // 14
    fontWeight: '600' as const,
    fontFamily: fontFamilies.primary,
    lineHeight: typography.lineHeight.tight,
  },
  h6: {
    fontSize: typography.fontSize.sm, // 12
    fontWeight: '600' as const,
    fontFamily: fontFamilies.primary,
    lineHeight: typography.lineHeight.tight,
  },
  body: {
    fontSize: typography.fontSize.base, // 14
    fontWeight: '400' as const,
    fontFamily: fontFamilies.primary,
    lineHeight: typography.lineHeight.normal,
  },
  'body-lg': {
    fontSize: typography.fontSize.md, // 16
    fontWeight: '400' as const,
    fontFamily: fontFamilies.primary,
    lineHeight: typography.lineHeight.normal,
  },
  'body-sm': {
    fontSize: typography.fontSize.sm, // 12
    fontWeight: '400' as const,
    fontFamily: fontFamilies.primary,
    lineHeight: typography.lineHeight.normal,
  },
  caption: {
    fontSize: typography.fontSize.xs, // 11
    fontWeight: '400' as const,
    fontFamily: fontFamilies.primary,
    lineHeight: typography.lineHeight.tight,
  },
  label: {
    fontSize: typography.fontSize.sm, // 12
    fontWeight: '500' as const,
    fontFamily: fontFamilies.primary,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.wide,
  },
};

export function Text({
  variant = 'body',
  weight = 'normal',
  color = 'textPrimary',
  align = 'left',
  uppercase = false,
  style,
  children,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[
        styles.text,
        variantStyles[variant],
        { fontWeight: fontWeights[weight] },
        { color: colors[color] },
        { textAlign: align },
        uppercase && { textTransform: 'uppercase' },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.textPrimary,
  },
});

// Convenience components for common text patterns
export function Display({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="display" {...props}>{children}</Text>;
}

export function H1({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="h1" {...props}>{children}</Text>;
}

export function H2({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="h2" {...props}>{children}</Text>;
}

export function H3({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="h3" {...props}>{children}</Text>;
}

export function H4({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="h4" {...props}>{children}</Text>;
}

export function H5({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="h5" {...props}>{children}</Text>;
}

export function H6({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="h6" {...props}>{children}</Text>;
}

export function Body({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="body" {...props}>{children}</Text>;
}

export function BodyLG({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="body-lg" {...props}>{children}</Text>;
}

export function BodySM({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="body-sm" {...props}>{children}</Text>;
}

export function Caption({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="caption" {...props}>{children}</Text>;
}

export function Label({ children, ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="label" {...props}>{children}</Text>;
}
