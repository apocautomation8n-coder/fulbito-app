import { CreditCard, Percent } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { StatPill } from '../../../components/ui/StatPill';
import { businessRules, formatCurrency, formatPercent } from '../../../config/businessRules';
import { colors, spacing, typography } from '../../../theme/theme';

export function AdminPaymentsScreen() {
  return (
    <Screen title="Pagos" subtitle="Comisiones y conciliacion de reservas online.">
      <View style={styles.stats}>
        <StatPill label="Comision" value={formatPercent(businessRules.platformCommissionRate)} />
        <StatPill label="Ventas" value={formatCurrency(0)} />
      </View>

      <Card style={styles.card}>
        <View style={styles.row}>
          <Percent color={colors.primary} size={20} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>Ingreso Fulbito estimado</Text>
            <Text style={styles.subtitle}>{formatCurrency(41000)} sobre reservas online pagadas.</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <CreditCard color={colors.coral} size={20} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>Marketplace</Text>
            <Text style={styles.subtitle}>Pendiente de credenciales MercadoPago y webhooks.</Text>
          </View>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  textBlock: {
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
});
