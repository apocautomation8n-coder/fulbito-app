import { ShieldAlert, Users } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { StatPill } from '../../../components/ui/StatPill';
import { company } from '../../../config/company';
import { colors, spacing, typography } from '../../../theme/theme';

export function AdminUsersScreen() {
  return (
    <Screen title="Usuarios" subtitle="Vista operativa inicial para soporte.">
      <View style={styles.stats}>
        <StatPill label="Jugadores" value="128" />
        <StatPill label="Clubes" value="12" />
      </View>

      <Card style={styles.card}>
        <View style={styles.row}>
          <Users color={colors.primary} size={20} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>Listado y busqueda</Text>
            <Text style={styles.subtitle}>Pendiente de conectar a Supabase.</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <ShieldAlert color={colors.coral} size={20} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>Bloqueos y reportes</Text>
            <Text style={styles.subtitle}>Necesario para revision App Store con contenido social.</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.title}>Datos legales</Text>
        <Text style={styles.subtitle}>{company.legalName}</Text>
        <Text style={styles.subtitle}>{company.supportEmail}</Text>
        <Text style={styles.subtitle}>{company.website}</Text>
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
