import React from 'react';
import { StyleSheet, Text, View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme/designSystem';

type EmptyStateProps = ViewProps & {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({ icon, title, description, action, style, ...props }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  icon: {
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  action: {
    marginTop: spacing.md,
  },
});
