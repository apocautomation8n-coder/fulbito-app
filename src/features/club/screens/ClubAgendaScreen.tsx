import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CalendarPlus, Clock, Plus } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { StatPill } from '../../../components/ui/StatPill';
import { bookingsRepository } from '../../../data/repositories/bookings.repository';
import { businessRules } from '../../../config/businessRules';
import { colors, spacing, typography } from '../../../theme/theme';
import type { Booking } from '../../../data/repositories/bookings.repository';

export function ClubAgendaScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      // TODO: Get actual club ID from auth context
      const clubBookings = await bookingsRepository.getClubBookings('demo-club');
      setBookings(clubBookings);
    } catch (error) {
      Alert.alert('Error', 'No pudimos cargar la agenda.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return 'Pendiente de pago';
      case 'paid':
        return 'Pagada';
      case 'manual_block':
        return 'Bloqueo manual';
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
        return colors.primary;
      case 'cancelled':
        return colors.muted;
      case 'refunded':
        return colors.muted;
      default:
        return colors.ink;
    }
  };

  return (
    <Screen title="Agenda" subtitle="Turnos online y bloqueos manuales del club.">
      <View style={styles.stats}>
        <StatPill label="Turno default" value={`${businessRules.defaultTurnDurationMinutes} min`} />
        <StatPill label="Reserva online" value="Pago si o si" />
      </View>

      <Button
        disabled={isLoading}
        icon={<CalendarPlus color={colors.primary} size={18} />}
        label={isLoading ? 'Cargando...' : 'Actualizar'}
        onPress={loadBookings}
        variant="secondary"
      />

      <Button
        icon={<Plus color={colors.surface} size={18} />}
        label="Cargar reserva manual"
        onPress={() => {
          Alert.alert('Funcionalidad pendiente', 'La carga manual de reservas se implementará pronto.');
        }}
      />

      {bookings.length === 0 && !isLoading && (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay reservas en la agenda.</Text>
          <Text style={styles.emptySubtext}>
            Las reservas online aparecerán aquí automáticamente.
          </Text>
        </Card>
      )}

      {bookings.map((booking) => (
        <Card key={booking.id} style={styles.card}>
          <View style={styles.row}>
            <Clock color={getStatusColor(booking.status)} size={20} />
            <View style={styles.textBlock}>
              <Text style={styles.title}>
                {new Date(booking.created_at).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                })}{' '}
                · Cancha #{booking.court_id.slice(0, 8)}
              </Text>
              <Text style={[styles.subtitle, { color: getStatusColor(booking.status) }]}>
                {getStatusLabel(booking.status)} · {businessRules.paymentHoldMinutes} min de bloqueo
              </Text>
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
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
