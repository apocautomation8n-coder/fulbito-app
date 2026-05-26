import { LogOut, Shield, User } from 'lucide-react-native';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { company } from '../../../config/company';
import { useAuth } from '../../../core/providers/AuthProvider';
import { colors, spacing, typography } from '../../../theme/theme';

export function AdminAccountScreen() {
  const { signOut, user } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Cerrar sesion', 'Queres salir de tu cuenta de administrador?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  return (
    <Screen title="Cuenta" subtitle="Sesion de administrador.">
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Shield color={colors.primary} size={22} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.name}>{user?.fullName || 'Administrador'}</Text>
            <Text style={styles.role}>Admin Fulbito</Text>
            <Text style={styles.email}>{user?.email || 'Sin email'}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <User color={colors.muted} size={20} />
          <Text style={styles.hint}>
            Al salir volves a la pantalla de inicio de sesion. Tu cuenta no se elimina.
          </Text>
        </View>
      </Card>

      <View style={styles.supportBox}>
        <Text style={styles.supportTitle}>Soporte</Text>
        <Text style={styles.supportText}>{company.supportEmail}</Text>
      </View>

      <Button
        fullWidth
        icon={<LogOut color={colors.ink} size={18} />}
        label="Salir"
        onPress={handleSignOut}
        size="lg"
        variant="secondary"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  role: {
    color: colors.primaryDark,
    fontSize: typography.small,
    fontWeight: '700',
  },
  email: {
    color: colors.muted,
    fontSize: typography.small,
  },
  hint: {
    color: colors.muted,
    flex: 1,
    fontSize: typography.small,
    lineHeight: 20,
  },
  supportBox: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  supportTitle: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '700',
  },
  supportText: {
    color: colors.muted,
    fontSize: typography.small,
  },
});
