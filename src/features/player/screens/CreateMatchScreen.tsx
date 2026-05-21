import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Clock, DollarSign, Users } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { bookingsRepository } from '../../../data/repositories/bookings.repository';
import { matchesRepository } from '../../../data/repositories/matches.repository';
import { businessRules, formatCurrency } from '../../../config/businessRules';
import { colors, spacing, typography } from '../../../theme/theme';

interface CreateMatchScreenProps {
  bookingId: string;
  courtName: string;
  totalAmount: number;
  onComplete: () => void;
  onCancel: () => void;
}

export function CreateMatchScreen({ bookingId, courtName, totalAmount, onComplete, onCancel }: CreateMatchScreenProps) {
  const [spotsTotal, setSpotsTotal] = useState('10');
  const [pricePerPlayer, setPricePerPlayer] = useState('');
  const [description, setDescription] = useState('');
  const [isSplitPayment, setIsSplitPayment] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatePricePerPlayer = () => {
    const spots = parseInt(spotsTotal, 10);
    if (isNaN(spots) || spots <= 0) return 0;
    return Math.ceil(totalAmount / spots);
  };

  const calculatePaymentDeadline = () => {
    const now = new Date();
    const deadline = new Date(now.getTime() + businessRules.defaultSplitDeadlineHoursBeforeKickoff * 60 * 60 * 1000);
    return deadline;
  };

  const handleCreateMatch = async () => {
    const spots = parseInt(spotsTotal, 10);
    if (isNaN(spots) || spots < 2) {
      Alert.alert('Cantidad inválida', 'Debe haber al menos 2 jugadores.');
      return;
    }

    const price = pricePerPlayer ? parseFloat(pricePerPlayer) : calculatePricePerPlayer();
    if (isNaN(price) || price <= 0) {
      Alert.alert('Precio inválido', 'El precio por jugador debe ser mayor a 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const deadline = calculatePaymentDeadline();

      // First, get the booking to get court_id and club_id
      const booking = await bookingsRepository.getBooking(bookingId);
      if (!booking) {
        throw new Error('Reserva no encontrada');
      }

      await matchesRepository.createMatch({
        booking_id: bookingId,
        organizer_id: 'demo-player', // TODO: Get from auth
        spots_total: spots,
        is_split_payment: isSplitPayment,
        price_per_player: price,
        payment_deadline: deadline.toISOString(),
        description: description.trim() || undefined,
      });

      Alert.alert(
        'Partido creado',
        isSplitPayment
          ? 'El partido ha sido abierto. Los jugadores podrán unirse y pagar su parte.'
          : 'El partido ha sido abierto. El organizador pagará el total.',
      );
      onComplete();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No pudimos crear el partido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedPrice = calculatePricePerPlayer();
  const deadline = calculatePaymentDeadline();

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Button icon={<ArrowLeft color={colors.ink} size={20} />} label="" onPress={onCancel} variant="ghost" />
          <Text style={styles.title}>Abrir partido</Text>
          <View style={{ width: 40 }} />
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.courtName}>{courtName}</Text>
          <Text style={styles.infoText}>
            Total de la reserva: {formatCurrency(totalAmount)}
          </Text>
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Configuración del partido</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cantidad de jugadores</Text>
            <View style={styles.inputWrapper}>
              <Users color={colors.muted} size={20} style={styles.inputIcon} />
              <TextInput
                keyboardType="number-pad"
                onChangeText={setSpotsTotal}
                placeholder="Ej: 10"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={spotsTotal}
              />
            </View>
            <Text style={styles.hint}>Incluye al organizador</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Precio por jugador (ARS)</Text>
            <View style={styles.inputWrapper}>
              <DollarSign color={colors.muted} size={20} style={styles.inputIcon} />
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setPricePerPlayer}
                placeholder={`Sugerido: ${formatCurrency(suggestedPrice)}`}
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={pricePerPlayer}
              />
            </View>
            {!pricePerPlayer && (
              <Text style={styles.hint}>Sugerido: {formatCurrency(suggestedPrice)} por jugador</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              multiline
              numberOfLines={3}
              onChangeText={setDescription}
              placeholder="Ej: Partido amistoso, nivel intermedio..."
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.textArea]}
              value={description}
            />
          </View>

          <View style={styles.toggleGroup}>
            <Text style={styles.label}>Dividir pagos entre jugadores</Text>
            <Text style={styles.toggleHint}>
              Si activas esta opción, cada jugador pagará su parte. Si no, el organizador paga
              el total.
            </Text>
            <Button
              label={isSplitPayment ? 'Sí, dividir pagos' : 'No, pago completo'}
              onPress={() => setIsSplitPayment(!isSplitPayment)}
              variant={isSplitPayment ? 'primary' : 'secondary'}
            />
          </View>
        </Card>

        {isSplitPayment && (
          <Card style={styles.infoCard}>
            <View style={styles.metaRow}>
              <Clock color={colors.primary} size={20} />
              <View>
                <Text style={styles.metaLabel}>Deadline de pago</Text>
                <Text style={styles.metaValue}>
                  {deadline.toLocaleDateString('es-AR')} {deadline.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
            <Text style={styles.infoText}>
              Los jugadores tienen hasta {businessRules.defaultSplitDeadlineHoursBeforeKickoff} horas antes del partido para pagar su parte.
            </Text>
          </Card>
        )}

        <Button
          disabled={isSubmitting}
          label={isSubmitting ? 'Creando partido...' : 'Abrir partido'}
          onPress={handleCreateMatch}
        />
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
  infoText: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 20,
  },
  formCard: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '700',
  },
  label: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '600',
  },
  inputGroup: {
    gap: spacing.sm,
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
  textArea: {
    minHeight: 80,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  hint: {
    color: colors.muted,
    fontSize: typography.tiny,
  },
  toggleGroup: {
    gap: spacing.sm,
  },
  toggleHint: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 18,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaLabel: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '600',
  },
  metaValue: {
    color: colors.primaryDark,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
