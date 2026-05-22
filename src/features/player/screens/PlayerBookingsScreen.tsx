import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, FlatList, View, RefreshControl, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Calendar as CalendarIcon, Clock, DollarSign, Activity, FileText } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { bookingsRepository } from '../../../data/repositories/bookings.repository';
import { formatCurrency } from '../../../config/businessRules';
import { colors, spacing, borderRadius, shadows } from '../../../theme/designSystem';
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
      'Confirmar Pago',
      `El monto total a abonar por tu reserva es de ${formatCurrency(booking.amount_due_now)}.`,
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Pagar con Mercado Pago',
          style: 'default',
          onPress: () => {
            Alert.alert('¡Pago Simulado Exitoso!', 'Gracias por reservar con Fulbito.');
          },
        },
      ],
    );
  };

  const handleViewDetail = (booking: Booking) => {
    Alert.alert(
      'Detalle del Turno',
      `📍 Complejo: ${booking.clubName || 'Demo Club'}\n⚽ Cancha: ${booking.courtName || 'Cancha general'}\n⏰ Horario: ${booking.startsAtLabel || 'Hoy'}\n💳 ID Transacción: ${booking.mp_payment_id || 'Bloqueo Manual'}`,
    );
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return { label: 'Pago Pendiente', variant: 'warning' as const };
      case 'paid':
        return { label: 'Confirmada', variant: 'success' as const };
      case 'manual_block':
        return { label: 'Bloqueado', variant: 'danger' as const };
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
    const isPending = booking.status === 'pending_payment';

    return (
      <Card variant="elevated" size="lg" style={styles.bookingCard}>
        {/* Card Header with Club & Court name */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.clubName}>{booking.clubName || 'La Docta Fútbol'}</Text>
            <Text style={styles.courtName}>{booking.courtName || 'Cancha 1'}</Text>
          </View>
          <Badge label={statusInfo.label} variant={statusInfo.variant} size="sm" />
        </View>

        {/* Date and cost parameters Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <CalendarIcon size={14} color={colors.textSecondary} />
            <Text style={styles.gridValue}>{booking.startsAtLabel || 'Hoy 21:00 hs'}</Text>
          </View>
          <View style={styles.gridItem}>
            <DollarSign size={14} color={colors.textSecondary} />
            <Text style={styles.gridValue}>{formatCurrency(booking.total_amount)}</Text>
          </View>
        </View>

        {/* Footer actions */}
        <View style={styles.cardFooter}>
          <Text style={styles.bookingIdText}>ID: #{booking.id.toUpperCase()}</Text>
          <Button
            icon={isPending ? <CreditCard size={16} color="#FFFFFF" /> : <FileText size={16} color={colors.textPrimary} />}
            label={isPending ? 'Pagar Ahora' : 'Ver Comprobante'}
            onPress={() => (isPending ? handlePay(booking) : handleViewDetail(booking))}
            variant={isPending ? 'primary' : 'secondary'}
            size="sm"
            style={styles.actionButton}
          />
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
              <Text style={styles.title}>Mis Reservas</Text>
              <Text style={styles.subtitle}>Sigue tus turnos contratados, los estados de cobro y accede a tus comprobantes de acceso.</Text>
            </View>
          }
          ListEmptyComponent={
            !isLoading ? (
              <EmptyState
                icon={<Activity size={48} color={colors.textTertiary} />}
                title="No tienes reservas registradas"
                description="Tus reservas confirmadas de turnos y alquileres aparecerán aquí."
              />
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: 16,
  },
  header: {
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  bookingCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  courtName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardLight,
    borderRadius: 10,
    padding: 12,
    gap: 12,
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gridValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  bookingIdText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.textTertiary,
    fontWeight: '600',
  },
  actionButton: {
    minHeight: 36,
    minWidth: 120,
  },
});
