import { Check, Clock, Users } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { businessRules, formatCurrency } from '../../../config/businessRules';
import { openMatches } from '../../../data/mock';
import { colors, spacing, typography } from '../../../theme/theme';

export function PlayerMatchesScreen() {
  return (
    <Screen
      title="Partidos"
      subtitle={`Split default: pago completo hasta ${businessRules.defaultSplitDeadlineHoursBeforeKickoff} horas antes.`}
    >
      <Button
        icon={<Users color={colors.surface} size={18} />}
        label="Abrir partido desde una reserva"
        onPress={() => undefined}
      />

      {openMatches.map((match) => (
        <Card key={match.id} style={styles.matchCard}>
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Users color={colors.primary} size={22} />
            </View>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{match.courtName}</Text>
              <Text style={styles.subtitle}>
                {match.neighborhood} · {match.startsAtLabel} · {match.format}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Check color={colors.success} size={16} />
              <Text style={styles.infoText}>{match.spotsNeeded} lugares</Text>
            </View>
            <View style={styles.infoItem}>
              <Clock color={colors.coral} size={16} />
              <Text style={styles.infoText}>{formatCurrency(match.pricePerPlayer)} c/u</Text>
            </View>
          </View>

          <Button label="Solicitar unirme" onPress={() => undefined} variant="secondary" />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  matchCard: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.small,
    marginTop: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  infoItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  infoText: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '700',
  },
});
