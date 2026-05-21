import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CreditCard, DollarSign, Landmark, ShieldCheck, TrendingUp } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { bookingsRepository } from '../../../data/repositories/bookings.repository';
import { businessRules, formatCurrency, formatPercent } from '../../../config/businessRules';
import { colors, spacing, typography } from '../../../theme/theme';

export function ClubPaymentsScreen() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [isMercadoPagoConnected, setIsMercadoPagoConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      // TODO: Get actual club ID from auth context
      const clubBookings = await bookingsRepository.getClubBookings('demo-club');
      
      const paid = clubBookings
        .filter((b) => b.status === 'paid')
        .reduce((sum, b) => sum + b.club_amount, 0);
      
      const pending = clubBookings
        .filter((b) => b.status === 'pending_payment')
        .reduce((sum, b) => sum + b.amount_due_now, 0);

      setTotalIncome(paid);
      setPendingPayments(pending);
    } catch (error) {
      Alert.alert('Error', 'No pudimos cargar los pagos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectMercadoPago = () => {
    Alert.alert(
      'Conectar MercadoPago',
      'Para conectar MercadoPago necesitas una cuenta de MercadoPago Marketplace. Contacta a soporte para obtener acceso.',
      [
        { text: 'Cancelar' },
        { text: 'Contactar soporte', onPress: () => {} },
      ],
    );
  };

  return (
    <Screen title="Pagos" subtitle="Ingresos y configuración de pagos.">
      <Button
        disabled={isLoading}
        label={isLoading ? 'Cargando...' : 'Actualizar'}
        onPress={loadPayments}
        variant="secondary"
      />

      <Card style={styles.card}>
        <View style={styles.row}>
          <TrendingUp color={colors.success} size={24} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>Ingresos totales</Text>
            <Text style={styles.subtitle}>Pagos recibidos de reservas online.</Text>
          </View>
        </View>
        <Text style={styles.amount}>{formatCurrency(totalIncome)}</Text>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <DollarSign color={colors.coral} size={24} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>Pagos pendientes</Text>
            <Text style={styles.subtitle}>Reservas esperando pago.</Text>
          </View>
        </View>
        <Text style={[styles.amount, styles.pendingAmount]}>{formatCurrency(pendingPayments)}</Text>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <Landmark color={isMercadoPagoConnected ? colors.success : colors.coral} size={24} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>MercadoPago</Text>
            <Text style={styles.subtitle}>
              {isMercadoPagoConnected ? 'Conectado' : 'Necesario para recibir reservas online.'}
            </Text>
          </View>
        </View>
        {!isMercadoPagoConnected && (
          <Button
            icon={<CreditCard color={colors.surface} size={18} />}
            label="Conectar MercadoPago"
            onPress={handleConnectMercadoPago}
          />
        )}
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <ShieldCheck color={colors.primary} size={24} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>Comisión Fulbito</Text>
            <Text style={styles.subtitle}>
              {formatPercent(businessRules.platformCommissionRate)} sobre el valor total del turno.
            </Text>
          </View>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    fontSize: typography.h2,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  amount: {
    color: colors.primaryDark,
    fontSize: typography.h1,
    fontWeight: '800',
  },
  pendingAmount: {
    color: colors.coral,
  },
});
