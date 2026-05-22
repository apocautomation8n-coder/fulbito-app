import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ArrowLeft, Calendar, Clock, CreditCard, MapPin, Users, ChevronDown, Info } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { bookingsRepository } from '../../../data/repositories/bookings.repository';
import { CreateMatchScreen } from './CreateMatchScreen';
import { businessRules, formatCurrency } from '../../../config/businessRules';
import { colors, spacing, shadows } from '../../../theme/designSystem';
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

// Available hour slots for selection (every 30 minutes)
const AVAILABLE_HOURS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00',
];

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const formatDateDisplay = (d: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Hoy, ' + d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
    }
    if (d.toDateString() === tomorrow.toDateString()) {
      return 'Mañana, ' + d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
    }
    return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const getLocalDeviceTime = () => {
    try {
      // Get the exact local hour and minute displayed on the device's clock
      const localTimeStr = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const [hStr, mStr] = localTimeStr.split(':');
      const hour = parseInt(hStr, 10);
      const minute = parseInt(mStr, 10);
      if (!isNaN(hour) && !isNaN(minute)) {
        return { hour, minute };
      }
    } catch (e) {
      // Fallback if locale string formatting throws
    }
    const now = new Date();
    return { hour: now.getHours(), minute: now.getMinutes() };
  };

  const getFilteredHours = () => {
    if (!isToday(selectedDate)) return AVAILABLE_HOURS;
    const { hour: currentHour, minute: currentMinute } = getLocalDeviceTime();
    
    return AVAILABLE_HOURS.filter((h) => {
      const [hStr, mStr] = h.split(':');
      const slotHour = parseInt(hStr, 10);
      const slotMinute = parseInt(mStr, 10);
      
      // Keep if hour is strictly in the future
      if (slotHour > currentHour) return true;
      // If hour is same, keep if minute is strictly in the future
      if (slotHour === currentHour && slotMinute > currentMinute) return true;
      
      return false;
    });
  };

  const filteredHours = getFilteredHours();

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      // Reset selected hour if it's now in the past for today
      if (isToday(date) && selectedHour) {
        const { hour: currentHour, minute: currentMinute } = getLocalDeviceTime();
        const [hStr, mStr] = selectedHour.split(':');
        const selectedH = parseInt(hStr, 10);
        const selectedM = parseInt(mStr, 10);
        
        const isPast = selectedH < currentHour || (selectedH === currentHour && selectedM <= currentMinute);
        if (isPast) {
          setSelectedHour('');
        }
      }
    }
  };

  const getEndTime = (startHour: string) => {
    const [h, m] = startHour.split(':').map(Number);
    const endMinutes = h * 60 + (m || 0) + durationMinutes;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  };

  const handleBooking = async () => {
    if (!selectedHour) {
      Alert.alert('Horario requerido', 'Por favor selecciona un horario de inicio para tu turno.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const bookingStartTime = new Date(`${dateStr}T${selectedHour}:00`);
      const endTimeStr = getEndTime(selectedHour);
      const bookingEndTime = new Date(`${dateStr}T${endTimeStr}:00`);

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
      // In demo mode, simulate a successful booking
      Alert.alert(
        '¡Reserva Confirmada! 🎉',
        `Tu turno en ${courtName} el ${formatDateDisplay(selectedDate)} a las ${selectedHour} hs ha sido reservado exitosamente.\n\nMonto: ${formatCurrency(calculateAmounts().amountDueNow)}`,
        [{ text: 'Genial', onPress: onComplete }],
      );
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onCancel} style={styles.backButton}>
              <ArrowLeft size={22} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Reservar Cancha ⚡</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Court Info Card */}
          <Card variant="elevated" size="lg" style={styles.courtCard}>
            <View style={styles.courtRow}>
              <View style={styles.courtIcon}>
                <Text style={styles.courtEmoji}>⚽</Text>
              </View>
              <View style={styles.courtMeta}>
                <Text style={styles.courtName}>{courtName}</Text>
                <Text style={styles.clubLabel}>{clubName}</Text>
              </View>
            </View>
            <View style={styles.chipRow}>
              <Badge label={format} variant="glow" size="sm" />
              <Badge label={`${durationMinutes} min`} variant="default" size="sm" />
              <Badge label={formatCurrency(pricePerSlot)} variant="accent" size="sm" />
            </View>
          </Card>

          {/* Date Selection */}
          <Card variant="elevated" size="lg" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📅 Fecha del Turno</Text>

            <Pressable style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
              <Calendar size={18} color={colors.primary} />
              <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
              <ChevronDown size={16} color={colors.textTertiary} />
            </Pressable>

            {/* Diagnostic/Debug row to inspect timezone matching */}
            <View style={styles.debugRow}>
              <View style={styles.debugBadge}>
                <Text style={styles.debugText}>
                  🕒 Reloj: {String(getLocalDeviceTime().hour).padStart(2, '0')}:{String(getLocalDeviceTime().minute).padStart(2, '0')} hs | ¿Es Hoy?: {isToday(selectedDate) ? 'Sí' : 'No'} | {selectedDate.getDate()}/{selectedDate.getMonth() + 1} vs {new Date().getDate()}/{new Date().getMonth() + 1}
                </Text>
              </View>
            </View>

            {showDatePicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date()}
                  maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                  onChange={onDateChange}
                  locale="es-AR"
                  themeVariant="light"
                />
                {Platform.OS === 'ios' && (
                  <Button
                    label="Confirmar fecha"
                    onPress={() => setShowDatePicker(false)}
                    variant="primary"
                    size="sm"
                    style={styles.confirmPickerButton}
                  />
                )}
              </View>
            )}
          </Card>

          {/* Hour Selection Grid */}
          <Card variant="elevated" size="lg" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>⏰ Horario de Inicio</Text>
            <Text style={styles.sectionSubtitle}>
              Selecciona la hora de inicio. La duración del turno es de {durationMinutes} minutos.
            </Text>

            {filteredHours.length === 0 ? (
              <View style={styles.noHoursBox}>
                <Text style={styles.noHoursText}>No quedan horarios disponibles para hoy. Probá seleccionar otro día.</Text>
              </View>
            ) : (
              <View style={styles.hoursGrid}>
                {filteredHours.map((hour) => {
                  const isSelected = selectedHour === hour;
                  return (
                    <Pressable
                      key={hour}
                      style={[styles.hourChip, isSelected && styles.hourChipSelected]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text style={[styles.hourChipText, isSelected && styles.hourChipTextSelected]}>
                        {hour}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {selectedHour !== '' && (
              <View style={styles.selectedTimeDisplay}>
                <Clock size={16} color={colors.primary} />
                <Text style={styles.selectedTimeText}>
                  Turno de {selectedHour} a {getEndTime(selectedHour)} hs
                </Text>
              </View>
            )}
          </Card>

          {/* Payment Summary */}
          <Card variant="elevated" size="lg" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>💳 Resumen de Pago</Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Precio del turno</Text>
              <Text style={styles.priceValue}>{formatCurrency(amounts.totalAmount)}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceCaption}>Comisión Fulbito (5%)</Text>
              <Text style={styles.priceCaption}>{formatCurrency(amounts.appCommission)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceHighlight}>
                {paymentMode === 'full' ? 'Total a pagar' : 'Seña (50%)'}
              </Text>
              <Text style={styles.priceTotal}>{formatCurrency(amounts.amountDueNow)}</Text>
            </View>

            {paymentMode === 'deposit' && (
              <View style={styles.priceRow}>
                <Text style={styles.priceCaption}>Resto a pagar en el lugar</Text>
                <Text style={styles.priceCaption}>
                  {formatCurrency(amounts.totalAmount - amounts.amountDueNow)}
                </Text>
              </View>
            )}
          </Card>

          {/* CTA Button */}
          <Button
            disabled={isSubmitting || !selectedHour}
            label={isSubmitting ? 'Procesando...' : 'Confirmar y Pagar'}
            onPress={handleBooking}
            variant="glow"
            size="lg"
            fullWidth
            loading={isSubmitting}
            icon={<CreditCard size={18} color="#FFFFFF" />}
            style={styles.ctaButton}
          />

          {/* Info Footer */}
          <View style={styles.infoFooter}>
            <View style={styles.infoRow}>
              <Info size={14} color={colors.textTertiary} />
              <Text style={styles.infoText}>
                Tienes {businessRules.paymentHoldMinutes} minutos para completar el pago. La reserva se cancela automáticamente si no se abona.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  courtCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  courtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courtIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  courtEmoji: {
    fontSize: 24,
  },
  courtMeta: {
    flex: 1,
  },
  courtName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  clubLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  pickerContainer: {
    marginTop: 12,
    backgroundColor: colors.cardLight,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 8,
  },
  confirmPickerButton: {
    marginTop: 8,
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hourChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.cardLight,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 68,
    alignItems: 'center',
  },
  hourChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  hourChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  hourChipTextSelected: {
    color: '#FFFFFF',
  },
  selectedTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  selectedTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  priceCaption: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  priceHighlight: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  priceTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  ctaButton: {
    marginTop: 4,
  },
  infoFooter: {
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  noHoursBox: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  noHoursText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  debugRow: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  debugBadge: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
