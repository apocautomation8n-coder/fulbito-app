import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/theme';

type StatPillProps = {
  label: string;
  value: string;
};

export function StatPill({ label, value }: StatPillProps) {
  return (
    <View style={styles.pill}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 72,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  value: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  label: {
    color: colors.muted,
    fontSize: typography.small,
    marginTop: spacing.xs,
  },
});
