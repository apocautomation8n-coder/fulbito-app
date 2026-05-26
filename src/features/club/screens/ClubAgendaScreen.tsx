import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar, CalendarPlus, CheckCircle2, Clock, Plus, RotateCcw, Star, UserCheck, XCircle } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { StatPill } from '../../../components/ui/StatPill';
import { useAuth } from '../../../core/providers/AuthProvider';
import { bookingsRepository } from '../../../data/repositories/bookings.repository';
import { courtsRepository } from '../../../data/repositories/courts.repository';
import { clubsService } from '../../../data/services/clubs.service';
import { businessRules, formatCurrency } from '../../../config/businessRules';
import { colors, spacing, typography } from '../../../theme/theme';
import type { BookingStatus, PaymentCollectionMode } from '../../../types/domain';

type AgendaItem = {
  id: string;
  courtId: string;
  courtName: string;
  customerName: string;
  day: string;
  dateKey: string;
  startTime: string;
  durationMinutes: number;
  amount: number;
  paymentMode: PaymentCollectionMode;
  status: BookingStatus;
  isManual: boolean;
};

type MatchReview = {
  attended: boolean;
  organizerRating: number;
};

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (date: Date) => {
  const today = new Date();
  const tomorrow = addDays(1);

  if (formatDateKey(date) === formatDateKey(today)) {
    return 'Hoy';
  }
  if (formatDateKey(date) === formatDateKey(tomorrow)) {
    return 'Dia siguiente';
  }

  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export function ClubAgendaScreen() {
  const { user, isConfigured } = useAuth();
  const [clubId, setClubId] = useState<string | null>(null);
  const [clubCourts, setClubCourts] = useState<Array<{ id: string; name: string }>>([]);
  const [bookings, setBookings] = useState<AgendaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualCourtId, setManualCourtId] = useState('');
  const [manualDate, setManualDate] = useState(new Date());
  const [showManualDatePicker, setShowManualDatePicker] = useState(false);
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualDuration, setManualDuration] = useState('60');
  const [manualName, setManualName] = useState('');
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewAttended, setReviewAttended] = useState(true);
  const [reviewStars, setReviewStars] = useState(5);
  const [matchReviews, setMatchReviews] = useState<Record<string, MatchReview>>({});

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort((a, b) => {
        return a.dateKey.localeCompare(b.dateKey) || a.startTime.localeCompare(b.startTime);
      }),
    [bookings],
  );

  const paidCount = bookings.filter((booking) => booking.status === 'paid').length;
  const pendingCount = bookings.filter((booking) => booking.status === 'pending_payment').length;
  const blockedCount = bookings.filter((booking) => booking.status === 'manual_block').length;

  useEffect(() => {
    if (!user?.id || !isConfigured) return;

    clubsService.getClubByOwner(user.id).then(async (club) => {
      if (!club) return;
      setClubId(club.id);
      const courts = await courtsRepository.getClubCourts(club.id);
      const mappedCourts = courts.map((court) => ({ id: court.id, name: court.name }));
      setClubCourts(mappedCourts);
      if (mappedCourts[0]) {
        setManualCourtId(mappedCourts[0].id);
      }
    });
  }, [isConfigured, user?.id]);

  const loadBookings = async () => {
    if (!clubId) {
      setBookings([]);
      return;
    }

    setIsLoading(true);
    try {
      const clubBookings = await bookingsRepository.getClubBookings(clubId);
      setBookings(
        clubBookings.map((booking) => ({
          id: booking.id,
          courtId: booking.court_id,
          courtName: booking.courtName ?? 'Cancha',
          customerName: booking.is_manual ? 'Bloqueo manual' : 'Reserva online',
          day: booking.startsAtLabel ?? formatDateLabel(new Date()),
          dateKey: formatDateKey(new Date()),
          startTime: '20:00',
          durationMinutes: businessRules.defaultTurnDurationMinutes,
          amount: booking.total_amount,
          paymentMode: booking.payment_mode,
          status: booking.status,
          isManual: booking.is_manual,
        })),
      );
    } catch {
      setBookings([]);
      Alert.alert('Error', 'No pudimos cargar la agenda del club.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'pending_payment':
        return 'Pendiente';
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

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'pending_payment':
        return colors.coral;
      case 'paid':
        return colors.success;
      case 'manual_block':
        return colors.primary;
      case 'cancelled':
      case 'refunded':
        return colors.muted;
      default:
        return colors.ink;
    }
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status,
            }
          : booking,
      ),
    );
  };

  const openMatchReview = (booking: AgendaItem) => {
    setReviewBookingId(booking.id);
    setReviewAttended(true);
    setReviewStars(5);
  };

  const saveMatchReview = () => {
    if (!reviewBookingId) return;

    setMatchReviews((current) => ({
      ...current,
      [reviewBookingId]: {
        attended: reviewAttended,
        organizerRating: reviewStars,
      },
    }));
    setReviewBookingId(null);

    Alert.alert(
      'Partido cerrado',
      reviewAttended
        ? `Asistencia confirmada. El organizador suma ${reviewStars} estrellas y pocos puntos verificados al ranking.`
        : 'Marcado como no asistieron. No suma puntos y queda senal para control antifraude.',
    );
  };

  const handleManualDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowManualDatePicker(false);
    }

    if (selectedDate) {
      setManualDate(selectedDate);
    }
  };

  const handleManualBlock = () => {
    const normalizedTime = manualStartTime.trim();
    if (!/^\d{2}:\d{2}$/.test(normalizedTime)) {
      Alert.alert('Hora invalida', 'Usa formato HH:MM, por ejemplo 21:30.');
      return;
    }

    const duration = parseInt(manualDuration, 10);
    if (isNaN(duration) || duration < 30) {
      Alert.alert('Duracion invalida', 'La duracion debe ser de al menos 30 minutos.');
      return;
    }

    const court = clubCourts.find((item) => item.id === manualCourtId) ?? clubCourts[0];
    if (!court || !clubId || !user?.id) {
      Alert.alert('Sin canchas', 'Carga al menos una cancha antes de bloquear horarios.');
      return;
    }
    setBookings((current) => [
      {
        id: `manual-${Date.now()}`,
        courtId: court.id,
        courtName: court.name,
        customerName: manualName.trim() || 'Reserva manual',
        day: formatDateLabel(manualDate),
        dateKey: formatDateKey(manualDate),
        startTime: normalizedTime,
        durationMinutes: duration,
        amount: 0,
        paymentMode: 'at_club',
        status: 'manual_block',
        isManual: true,
      },
      ...current,
    ]);
    setManualStartTime('');
    setManualName('');
    setManualDuration('60');
    setShowManualForm(false);
    Alert.alert('Slot bloqueado', 'Ese horario ya no aparece disponible para jugadores.');
  };

  return (
    <Screen title="Agenda" subtitle="Turnos online y bloqueos manuales del club.">
      <View style={styles.stats}>
        <StatPill label="Pagadas" value={paidCount.toString()} />
        <StatPill label="Pendientes" value={pendingCount.toString()} />
        <StatPill label="Bloqueos" value={blockedCount.toString()} />
      </View>

      <View style={styles.actionsTop}>
        <Button
          disabled={isLoading}
          icon={<CalendarPlus color={colors.primary} size={18} />}
          label={isLoading ? 'Cargando...' : 'Actualizar'}
          onPress={loadBookings}
          style={styles.topButton}
          variant="secondary"
        />
        <Button
          icon={<Plus color={colors.surface} size={18} />}
          label={showManualForm ? 'Cerrar carga' : 'Reserva manual'}
          onPress={() => setShowManualForm((value) => !value)}
          style={styles.topButton}
        />
      </View>

      {showManualForm && (
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>Bloquear horario</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cancha</Text>
            <View style={styles.courtRow}>
              {clubCourts.map((court) => {
                const selected = manualCourtId === court.id;
                return (
                  <Pressable
                    key={court.id}
                    onPress={() => setManualCourtId(court.id)}
                    style={[styles.courtChip, selected && styles.courtChipSelected]}
                  >
                    <Text style={[styles.courtChipText, selected && styles.courtChipTextSelected]}>
                      {court.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dia</Text>
            <Pressable onPress={() => setShowManualDatePicker(true)} style={styles.dateField}>
              <Calendar color={colors.primary} size={18} />
              <Text style={styles.dateText}>{formatDateLabel(manualDate)}</Text>
            </Pressable>
            {showManualDatePicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={manualDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date()}
                  onChange={handleManualDateChange}
                  locale="es-AR"
                  themeVariant="light"
                />
                {Platform.OS === 'ios' && (
                  <Button
                    label="Confirmar fecha"
                    onPress={() => setShowManualDatePicker(false)}
                    variant="secondary"
                    size="sm"
                  />
                )}
              </View>
            )}
          </View>

          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <Text style={styles.label}>Hora inicio</Text>
              <TextInput
                keyboardType="numbers-and-punctuation"
                onChangeText={setManualStartTime}
                placeholder="21:30"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={manualStartTime}
              />
            </View>
            <View style={styles.formColumn}>
              <Text style={styles.label}>Minutos</Text>
              <TextInput
                keyboardType="number-pad"
                onChangeText={setManualDuration}
                placeholder="60"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={manualDuration}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Detalle interno</Text>
            <TextInput
              onChangeText={setManualName}
              placeholder="Ej: cumple, clase, mantenimiento"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={manualName}
            />
          </View>

          <Button label="Bloquear slot" onPress={handleManualBlock} />
        </Card>
      )}

      {sortedBookings.map((booking) => (
        <Card key={booking.id} style={styles.card}>
          <View style={styles.row}>
            <Clock color={getStatusColor(booking.status)} size={20} />
            <View style={styles.textBlock}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{booking.courtName}</Text>
                <Text style={[styles.status, { color: getStatusColor(booking.status) }]}>
                  {getStatusLabel(booking.status)}
                </Text>
              </View>
              <Text style={styles.subtitle}>
                {booking.day} {booking.startTime} hs - {booking.durationMinutes} min
              </Text>
              <Text style={styles.subtitle}>
                {booking.customerName} - Pago en club
                {booking.amount > 0 ? ` - ${formatCurrency(booking.amount)}` : ''}
              </Text>
              {matchReviews[booking.id] && (
                <Text style={styles.reviewResult}>
                  {matchReviews[booking.id].attended
                    ? `Asistencia OK - Organizador ${matchReviews[booking.id].organizerRating}/5`
                    : 'No asistieron - sin puntos'}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.cardActions}>
            {booking.status === 'paid' && !booking.isManual && !matchReviews[booking.id] && (
              <Button
                icon={<UserCheck color={colors.ink} size={15} />}
                label="Cerrar partido"
                onPress={() => openMatchReview(booking)}
                style={styles.actionButton}
                variant="secondary"
                size="sm"
              />
            )}
            {booking.status === 'pending_payment' && (
              <Button
                icon={<CheckCircle2 color={colors.ink} size={15} />}
                label="Pagada"
                onPress={() => updateBookingStatus(booking.id, 'paid')}
                style={styles.actionButton}
                variant="secondary"
                size="sm"
              />
            )}
            {booking.status !== 'cancelled' && (
              <Button
                icon={<XCircle color={colors.danger} size={15} />}
                label={booking.isManual ? 'Liberar' : 'Cancelar'}
                onPress={() => updateBookingStatus(booking.id, 'cancelled')}
                style={styles.actionButton}
                variant="danger"
                size="sm"
              />
            )}
            {booking.status === 'cancelled' && (
              <Button
                icon={<RotateCcw color={colors.ink} size={15} />}
                label="Reactivar"
                onPress={() => updateBookingStatus(booking.id, booking.isManual ? 'manual_block' : 'pending_payment')}
                style={styles.actionButton}
                variant="secondary"
                size="sm"
              />
            )}
          </View>

          {reviewBookingId === booking.id && (
            <View style={styles.reviewBox}>
              <Text style={styles.formTitle}>Validar partido</Text>
              <Text style={styles.reviewHelp}>
                Esto define si suma puntos al ranking. Solo deberia cerrarse cuando el turno ya termino.
              </Text>

              <View style={styles.attendanceRow}>
                <Pressable
                  onPress={() => setReviewAttended(true)}
                  style={[styles.attendanceChip, reviewAttended && styles.attendanceChipSelected]}
                >
                  <Text style={[styles.attendanceText, reviewAttended && styles.attendanceTextSelected]}>
                    Fueron
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setReviewAttended(false)}
                  style={[styles.attendanceChip, !reviewAttended && styles.attendanceChipDanger]}
                >
                  <Text style={[styles.attendanceText, !reviewAttended && styles.attendanceTextSelected]}>
                    No fueron
                  </Text>
                </Pressable>
              </View>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= reviewStars;
                  return (
                    <Pressable key={star} onPress={() => setReviewStars(star)} style={styles.starButton}>
                      <Star
                        color={active ? colors.coral : colors.muted}
                        fill={active ? colors.coral : 'transparent'}
                        size={24}
                      />
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.reviewActions}>
                <Button
                  label="Cancelar"
                  onPress={() => setReviewBookingId(null)}
                  style={styles.actionButton}
                  variant="secondary"
                  size="sm"
                />
                <Button
                  label="Guardar validacion"
                  onPress={saveMatchReview}
                  style={styles.actionButton}
                  size="sm"
                />
              </View>
            </View>
          )}
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
  actionsTop: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  topButton: {
    flex: 1,
  },
  formCard: {
    gap: spacing.md,
  },
  formTitle: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '800',
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '700',
  },
  courtRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  courtChip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  courtChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  courtChipText: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '800',
  },
  courtChipTextSelected: {
    color: colors.surface,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: typography.body,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  dateField: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  dateText: {
    color: colors.ink,
    flex: 1,
    fontSize: typography.body,
    fontWeight: '700',
  },
  pickerContainer: {
    gap: spacing.sm,
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
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  title: {
    color: colors.ink,
    flex: 1,
    fontSize: typography.body,
    fontWeight: '800',
  },
  status: {
    fontSize: typography.small,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.small,
    marginTop: spacing.xs,
  },
  reviewResult: {
    color: colors.success,
    fontSize: typography.small,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flexGrow: 1,
  },
  reviewBox: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  reviewHelp: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 18,
  },
  attendanceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  attendanceChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  attendanceChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  attendanceChipDanger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  attendanceText: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '800',
  },
  attendanceTextSelected: {
    color: colors.surface,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
