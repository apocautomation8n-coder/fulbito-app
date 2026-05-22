import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, FlatList, View, RefreshControl } from 'react-native';
import { CreditCard, Calendar as CalendarIcon, Clock, DollarSign, Activity } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { H3, Body, Caption } from '../../../components/ui/Typography';
import { bookingsRepository } from '../../../data/repositories/bookings.repository';
import { formatCurrency } from '../../../config/businessRules';
import { colors, spacing, borderRadius } from '../../../theme/designSystem';
import type { Booking } from '../../../data/repositories/bookings.repository';

export function PlayerBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
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
          text: 'Pagar con MercadoPago',
          onPress: () => {
            Alert.alert('Pago en proceso', 'MercadoPago está procesando tu transacción.');
          },
        },
      ],
    );
  };

  const handleViewDetail = (booking: Booking) => {
    Alert.alert('Detalle de reserva', `Reserva #${booking.id}`);
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return { label: 'Pago Pendiente', variant: 'warning' as const };
      case 'paid':
        return { label: 'Confirmada', variant: 'success' as const };
      case 'manual_block':
        return { label: 'Bloqueada', variant: 'danger' as const };
      case 'cancelled':
        return { label: 'Cancelada', variant: 'default' as const };
      case 'refunded':
        return { label: 'Reembolsada', variant: 'default' as const };
      default:
        return { label: status, variant: 'default' as const };
    }
  };

  const renderBookingItem = ({ item: booking }: { item: Booking }) => {
    const statusInfo = getStatusDetails(booking.status);

    // Mock Date parsing
    const dateStr = new Date().toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
    });

    return (
      <Card variant="elevated" size="md" style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <View style={styles.titleBlock}>
            <Body style={styles.courtTitle}>Cancha #{booking.court_id.slice(0, 4).toUpperCase()}</Body>
            <Caption style={styles.idText}>Reserva: #{booking.id.slice(0, 8)}</Caption>
          </View>
          <Badge label={statusInfo.label} variant={statusInfo.variant} size="sm" />
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <CalendarIcon size={14} color={colors.textSecondary} />
            <Caption style={styles.gridValue}>{dateStr}</Caption>
          </View>
          <View style={styles.gridItem}>
            <Clock size={14} color={colors.textSecondary} />
            <Caption style={styles.gridValue}>20:00 hs</Caption>
          </View>
          <View style={styles.gridItem}>
            <DollarSign size={14} color={colors.textSecondary} />
            <Caption style={styles.gridValue}>{formatCurrency(booking.total_amount)}</Caption>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Button
            icon={<CreditCard size={16} color={booking.status === 'pending_payment' ? colors.background : colors.textPrimary} />}
            label={booking.status === 'pending_payment' ? 'Pagar ahora' : 'Ver Detalle'}
            onPress={() => (booking.status === 'pending_payment' ? handlePay(booking) : handleViewDetail(booking))}
            variant={booking.status === 'pending_payment' ? 'primary' : 'secondary'}
            size="sm"
            style={styles.actionButton}
          />
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadBookings}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <H3>Mis Reservas</H3>
            <Body style={styles.subtitle}>Tus turnos reservados y el estado de tus pagos.</Body>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon={<Activity size={40} color={colors.textTertiary} />}
              title="No tienes reservas"
              description="Busca una cancha disponible para hacer tu primera reserva."
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  bookingCard: {
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleBlock: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  courtTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  idText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  gridContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  gridItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gridValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  actionButton: {
    minHeight: 36,
  },
});

