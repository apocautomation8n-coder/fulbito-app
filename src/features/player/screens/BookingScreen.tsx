import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Calendar, Clock, DollarSign, MapPin, Users } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { bookingsRepository } from '../../../data/repositories/bookings.repository';
import { CreateMatchScreen } from './CreateMatchScreen';
import { businessRules, formatCurrency } from '../../../config/businessRules';
import { colors, spacing, typography } from '../../../theme/theme';
import type { PaymentCollectionMode } from '../../../types/domain';

interface BookingScreenProps {
  courtId: string;
  courtName: string;
  clubName: string;
  format: string;
  pricePerSlot: number;
  durationMinutes: number;
  paymentMode: PaymentCollectionMode;
  onComplete: () => void;
  onCancel: () => void;
}

export function BookingScreen({
  courtId,
  courtName,
  clubName,
  format,
  pricePerSlot,
  durationMinutes,
  paymentMode,
  onComplete,
  onCancel,
}: BookingScreenProps) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

  const calculateAmounts = () => {
    const appCommission = pricePerSlot * businessRules.platformCommissionRate;
    const clubAmount = pricePerSlot - appCommission;
    const amountDueNow = paymentMode === 'full' ? pricePerSlot : pricePerSlot * 0.5;

    return {
      totalAmount: pricePerSlot,
      appCommission,
      clubAmount,
      amountDueNow,
    };
  };

  const handleBooking = async () => {
    if (!date.trim()) {
      Alert.alert('Fecha requerida', 'Por favor selecciona una fecha.');
      return;
    }

    if (!startTime.trim()) {
      Alert.alert('Hora de inicio requerida', 'Por favor ingresa la hora de inicio.');
      return;
    }

    if (!endTime.trim()) {
      Alert.alert('Hora de fin requerida', 'Por favor ingresa la hora de fin.');
      return;
    }

    if (startTime >= endTime) {
      Alert.alert('Horario inválido', 'La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingStartTime = new Date(`${date}T${startTime}`);
      const bookingEndTime = new Date(`${date}T${endTime}`);

      // Create time slot
      const slot = await bookingsRepository.createTimeSlot(
        courtId,
        bookingStartTime.toISOString(),
        bookingEndTime.toISOString(),
      );

      // Hold the slot for payment
      const holdUntil = new Date(Date.now() + businessRules.paymentHoldMinutes * 60 * 1000);
      await bookingsRepository.holdSlot(slot.id, 'demo-player', holdUntil.toISOString());

      const amounts = calculateAmounts();

      // Create booking (without payment for now - will be implemented with MercadoPago)
      const booking = await bookingsRepository.createBooking({
        slot_id: slot.id,
        club_id: 'demo-club', // TODO: Get from court
        court_id: courtId,
        total_amount: amounts.totalAmount,
        amount_due_now: amounts.amountDueNow,
        app_commission: amounts.appCommission,
        club_amount: amounts.clubAmount,
        payment_mode: paymentMode,
        player_id: 'demo-player', // TODO: Get from auth
      });

      setCreatedBookingId(booking.id);
      setShowCreateMatch(true);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No pudimos crear la reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const amounts = calculateAmounts();

  if (showCreateMatch && createdBookingId) {
    return (
      <CreateMatchScreen
        bookingId={createdBookingId}
        courtName={courtName}
        totalAmount={amounts.totalAmount}
        onComplete={() => {
          setShowCreateMatch(false);
          setCreatedBookingId(null);
          onComplete();
        }}
        onCancel={() => {
          setShowCreateMatch(false);
          setCreatedBookingId(null);
          onComplete();
        }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Button icon={<ArrowLeft color={colors.ink} size={20} />} label="" onPress={onCancel} variant="ghost" />
          <Text style={styles.title}>Reservar cancha</Text>
          <View style={{ width: 40 }} />
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.courtName}>{courtName}</Text>
          <Text style={styles.clubName}>{clubName}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin color={colors.muted} size={16} />
              <Text style={styles.metaText}>{format}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock color={colors.muted} size={16} />
              <Text style={styles.metaText}>{durationMinutes} min</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Selecciona horario</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha</Text>
            <View style={styles.inputWrapper}>
              <Calendar color={colors.muted} size={20} style={styles.inputIcon} />
              <TextInput
                keyboardType="numbers-and-punctuation"
                onChangeText={setDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={date}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.half]}>
              <Text style={styles.label}>Inicio</Text>
              <View style={styles.inputWrapper}>
                <Clock color={colors.muted} size={20} style={styles.inputIcon} />
                <TextInput
                  keyboardType="numbers-and-punctuation"
                  onChangeText={setStartTime}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={startTime}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.half]}>
              <Text style={styles.label}>Fin</Text>
              <View style={styles.inputWrapper}>
                <Clock color={colors.muted} size={20} style={styles.inputIcon} />
                <TextInput
                  keyboardType="numbers-and-punctuation"
                  onChangeText={setEndTime}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={endTime}
                />
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.priceCard}>
          <Text style={styles.sectionTitle}>Resumen de pago</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio del turno</Text>
            <Text style={styles.priceValue}>{formatCurrency(amounts.totalAmount)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Comisión Fulbito (5%)</Text>
            <Text style={styles.priceValue}>{formatCurrency(amounts.appCommission)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {paymentMode === 'full' ? 'Pago a realizar' : 'Seña (50%)'}
            </Text>
            <Text style={[styles.priceValue, styles.priceValueHighlight]}>
              {formatCurrency(amounts.amountDueNow)}
            </Text>
          </View>

          {paymentMode === 'deposit' && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Resto a pagar en el lugar</Text>
              <Text style={styles.priceValue}>{formatCurrency(amounts.totalAmount - amounts.amountDueNow)}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(amounts.totalAmount)}</Text>
          </View>
        </Card>

        <Button
          disabled={isSubmitting}
          label={isSubmitting ? 'Procesando...' : 'Confirmar reserva'}
          onPress={handleBooking}
        />

        <Text style={styles.info}>
          Tienes {businessRules.paymentHoldMinutes} minutos para completar el pago. La reserva se
          cancelará automáticamente si no se paga.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  infoCard: {
    gap: spacing.sm,
  },
  courtName: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '700',
  },
  clubName: {
    color: colors.muted,
    fontSize: typography.body,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.muted,
    fontSize: typography.small,
  },
  formCard: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '700',
  },
  inputGroup: {
    gap: spacing.sm,
  },
  half: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  label: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '600',
  },
  inputWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  inputIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: typography.body,
    minHeight: 48,
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
    width: '100%',
  },
  priceCard: {
    gap: spacing.md,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    color: colors.muted,
    fontSize: typography.small,
  },
  priceValue: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '600',
  },
  priceValueHighlight: {
    color: colors.primaryDark,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  totalLabel: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '700',
  },
  totalValue: {
    color: colors.primaryDark,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  info: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 20,
    textAlign: 'center',
  },
});
