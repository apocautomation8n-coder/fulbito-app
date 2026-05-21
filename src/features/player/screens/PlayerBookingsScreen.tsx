import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CreditCard, TimerReset } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { bookingsRepository } from '../../../data/repositories/bookings.repository';
import { formatCurrency } from '../../../config/businessRules';
import { colors, spacing, typography } from '../../../theme/theme';
import type { Booking } from '../../../data/repositories/bookings.repository';

export function PlayerBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      // TODO: Get actual player ID from auth context
      const playerBookings = await bookingsRepository.getPlayerBookings('demo-player');
      setBookings(playerBookings);
    } catch (error) {
      Alert.alert('Error', 'No pudimos cargar tus reservas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = (booking: Booking) => {
    Alert.alert(
      'Pagar reserva',
      `El monto a pagar es ${formatCurrency(booking.amount_due_now)}.`,
      [
        { text: 'Cancelar' },
        {
          text: 'Pagar',
          onPress: () => {
            // TODO: Implement MercadoPago payment flow
            Alert.alert('Funcionalidad pendiente', 'El pago con MercadoPago se implementará pronto.');
          },
        },
      ],
    );
  };

  const handleViewDetail = (booking: Booking) => {
    Alert.alert('Detalle de reserva', `Reserva #${booking.id}`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'Pago pendiente';
      case 'paid':
        return 'Confirmada';
      case 'manual_block':
        return 'Bloqueada manualmente';
      case 'cancelled':
        return 'Cancelada';
      case 'refunded':
        return 'Reembolsada';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return colors.coral;
      case 'paid':
        return colors.success;
      case 'manual_block':
        return colors.danger;
      case 'cancelled':
        return colors.muted;
      case 'refunded':
        return colors.muted;
      default:
        return colors.ink;
    }
  };

  return (
    <Screen title="Reservas" subtitle="Tus turnos y pagos pendientes.">
      <Button
        disabled={isLoading}
        label={isLoading ? 'Cargando...' : 'Actualizar'}
        onPress={loadBookings}
        variant="secondary"
      />

      {bookings.length === 0 && !isLoading && (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No tienes reservas activas.</Text>
          <Text style={styles.emptySubtext}>
            Reserva una cancha para comenzar a jugar.
          </Text>
        </Card>
      )}

      {bookings.map((booking) => (
        <Card key={booking.id} style={styles.bookingCard}>
          <View style={styles.row}>
            <View>
              <Text style={styles.title}>Reserva #{booking.id.slice(0, 8)}</Text>
              <Text style={styles.subtitle}>
                Cancha #{booking.court_id.slice(0, 8)}
              </Text>
            </View>
            <Text style={styles.amount}>{formatCurrency(booking.total_amount)}</Text>
          </View>

          <View style={styles.statusRow}>
            <TimerReset color={getStatusColor(booking.status)} size={16} />
            <Text style={[styles.status, { color: getStatusColor(booking.status) }]}>
              {getStatusLabel(booking.status)}
            </Text>
          </View>

          <Button
            icon={<CreditCard color={colors.surface} size={18} />}
            label={booking.status === 'pending_payment' ? 'Pagar ahora' : 'Ver detalle'}
            onPress={() => (booking.status === 'pending_payment' ? handlePay(booking) : handleViewDetail(booking))}
            variant={booking.status === 'pending_payment' ? 'primary' : 'secondary'}
          />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    color: colors.muted,
    fontSize: typography.small,
    textAlign: 'center',
  },
  bookingCard: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
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
  amount: {
    color: colors.primaryDark,
    fontSize: typography.body,
    fontWeight: '800',
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  status: {
    fontSize: typography.small,
    fontWeight: '800',
  },
});
