import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft, Calendar, Clock, DollarSign, MapPin, Users } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { ProgressStepper } from '../../../components/ui/ProgressStepper';
import { Badge } from '../../../components/ui/Badge';
import { H2, H3, H4, Body, Caption } from '../../../components/ui/Typography';
import { bookingsRepository } from '../../../data/repositories/bookings.repository';
import { CreateMatchScreen } from './CreateMatchScreen';
import { businessRules, formatCurrency } from '../../../config/businessRules';
import { colors, spacing } from '../../../theme/designSystem';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);


  const steps = [
    { id: '1', label: 'Horario', completed: currentStep > 1, current: currentStep === 1 },
    { id: '2', label: 'Pago', completed: currentStep > 2, current: currentStep === 2 },
    { id: '3', label: 'Confirmar', completed: currentStep > 3, current: currentStep === 3 },
  ];

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

      const slot = await bookingsRepository.createTimeSlot(
        courtId,
        bookingStartTime.toISOString(),
        bookingEndTime.toISOString(),
      );

      const holdUntil = new Date(Date.now() + businessRules.paymentHoldMinutes * 60 * 1000);
      await bookingsRepository.holdSlot(slot.id, 'demo-player', holdUntil.toISOString());

      const amounts = calculateAmounts();

      const booking = await bookingsRepository.createBooking({
        slot_id: slot.id,
        club_id: 'demo-club',
        court_id: courtId,
        total_amount: amounts.totalAmount,
        amount_due_now: amounts.amountDueNow,
        app_commission: amounts.appCommission,
        club_amount: amounts.clubAmount,
        payment_mode: paymentMode,
        player_id: 'demo-player',
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
        <View>
          <View style={styles.header}>
            <Button icon={<ArrowLeft size={20} />} label="" onPress={onCancel} variant="ghost" size="sm" />
            <H2>Reservar cancha</H2>
            <View style={{ width: 40 }} />
          </View>

          <ProgressStepper steps={steps} style={styles.stepper} />

          <Card variant="glass" size="lg" style={styles.infoCard}>
            <H3>{courtName}</H3>
            <Body style={styles.clubName}>{clubName}</Body>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MapPin size={16} color={colors.textSecondary} />
                <Caption>{format}</Caption>
              </View>
              <View style={styles.metaItem}>
                <Clock size={16} color={colors.textSecondary} />
                <Caption>{durationMinutes} min</Caption>
              </View>
            </View>
          </Card>

          <Card variant="elevated" size="lg" style={styles.formCard}>
            <H4 style={styles.sectionTitle}>Selecciona horario</H4>

            <View style={styles.inputGroup}>
              <Input
                keyboardType="numbers-and-punctuation"
                onChangeText={setDate}
                placeholder="Fecha (DD/MM/YYYY)"
                value={date}
                variant="glass"
                leftIcon={<Calendar size={20} color={colors.textSecondary} />}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.half]}>
                <Input
                  keyboardType="numbers-and-punctuation"
                  onChangeText={setStartTime}
                  placeholder="Inicio (HH:MM)"
                  value={startTime}
                  variant="glass"
                  leftIcon={<Clock size={20} color={colors.textSecondary} />}
                />
              </View>

              <View style={[styles.inputGroup, styles.half]}>
                <Input
                  keyboardType="numbers-and-punctuation"
                  onChangeText={setEndTime}
                  placeholder="Fin (HH:MM)"
                  value={endTime}
                  variant="glass"
                  leftIcon={<Clock size={20} color={colors.textSecondary} />}
                />
              </View>
            </View>
          </Card>

          <Card variant="elevated" size="lg" style={styles.priceCard}>
            <H4 style={styles.sectionTitle}>Resumen de pago</H4>

            <View style={styles.priceRow}>
              <Body>Precio del turno</Body>
              <Body style={styles.priceValue}>{formatCurrency(amounts.totalAmount)}</Body>
            </View>

            <View style={styles.priceRow}>
              <Caption>Comisión Fulbito (5%)</Caption>
              <Caption style={styles.priceValue}>{formatCurrency(amounts.appCommission)}</Caption>
            </View>

            <View style={styles.priceRow}>
              <Body style={styles.priceLabelHighlight}>
                {paymentMode === 'full' ? 'Pago a realizar' : 'Seña (50%)'}
              </Body>
              <H3 style={styles.priceValueHighlight}>
                {formatCurrency(amounts.amountDueNow)}
              </H3>
            </View>

            {paymentMode === 'deposit' && (
              <View style={styles.priceRow}>
                <Caption>Resto a pagar en el lugar</Caption>
                <Caption style={styles.priceValue}>
                  {formatCurrency(amounts.totalAmount - amounts.amountDueNow)}
                </Caption>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <H4>Total</H4>
              <H3 style={styles.totalValue}>{formatCurrency(amounts.totalAmount)}</H3>
            </View>
          </Card>

          <Button
            disabled={isSubmitting}
            label={isSubmitting ? 'Procesando...' : 'Confirmar reserva'}
            onPress={handleBooking}
            variant="glow"
            size="lg"
            fullWidth
            loading={isSubmitting}
          />

          <View style={styles.infoContainer}>
            <Badge label={`Tienes ${businessRules.paymentHoldMinutes} minutos para completar el pago`} variant="default" />
            <Caption style={styles.info}>
              La reserva se cancelará automáticamente si no se paga.
            </Caption>
          </View>
        </View>
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
    marginBottom: spacing.lg,
  },
  stepper: {
    marginBottom: spacing.lg,
  },
  infoCard: {
    padding: spacing.lg,
  },
  clubName: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  formCard: {
    padding: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  half: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  priceCard: {
    padding: spacing.lg,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  priceValue: {
    fontWeight: '600',
  },
  priceLabelHighlight: {
    color: colors.primary,
  },
  priceValueHighlight: {
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginVertical: spacing.md,
  },
  totalValue: {
    color: colors.primary,
  },
  infoContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  info: {
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
