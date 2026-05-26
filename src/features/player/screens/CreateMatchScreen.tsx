import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft, Clock, DollarSign, Users, Trophy } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Toggle';
import { Badge } from '../../../components/ui/Badge';
import { H2, H3, H4, Body, Caption } from '../../../components/ui/Typography';
import { useAuth } from '../../../core/providers/AuthProvider';
import { bookingsRepository } from '../../../data/repositories/bookings.repository';
import { matchesRepository } from '../../../data/repositories/matches.repository';
import { businessRules, formatCurrency } from '../../../config/businessRules';
import { colors, spacing } from '../../../theme/designSystem';


interface CreateMatchScreenProps {
  bookingId: string;
  courtName: string;
  totalAmount: number;
  onComplete: () => void;
  onCancel: () => void;
}

export function CreateMatchScreen({ bookingId, courtName, totalAmount, onComplete, onCancel }: CreateMatchScreenProps) {
  const { user } = useAuth();
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

      const booking = await bookingsRepository.getBooking(bookingId);
      if (!booking) {
        throw new Error('Reserva no encontrada');
      }

      await matchesRepository.createMatch({
        booking_id: bookingId,
        organizer_id: user?.id ?? booking.player_id ?? '',
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
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        <View>
          <View style={styles.header}>
            <Button icon={<ArrowLeft size={20} />} label="" onPress={onCancel} variant="ghost" size="sm" />
            <H2>Abrir partido</H2>
            <View style={{ width: 40 }} />
          </View>

          <Card variant="glass" size="lg" style={styles.infoCard}>
            <H3>{courtName}</H3>
            <Badge label={`Total: ${formatCurrency(totalAmount)}`} variant="accent" />
          </Card>

          <Card variant="elevated" size="lg" style={styles.formCard}>
            <H4 style={styles.sectionTitle}>Configuración del partido</H4>

            <View style={styles.inputGroup}>
              <Input
                keyboardType="number-pad"
                onChangeText={setSpotsTotal}
                placeholder="Cantidad de jugadores"
                value={spotsTotal}
                variant="glass"
                leftIcon={<Users size={20} color={colors.textSecondary} />}
              />
              <Caption style={styles.hint}>Incluye al organizador</Caption>
            </View>

            <View style={styles.inputGroup}>
              <Input
                keyboardType="decimal-pad"
                onChangeText={setPricePerPlayer}
                placeholder={`Precio sugerido: ${formatCurrency(suggestedPrice)}`}
                value={pricePerPlayer}
                variant="glass"
                leftIcon={<DollarSign size={20} color={colors.textSecondary} />}
              />
              {!pricePerPlayer && (
                <Caption style={styles.hint}>Sugerido: {formatCurrency(suggestedPrice)} por jugador</Caption>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Input
                multiline
                numberOfLines={3}
                onChangeText={setDescription}
                placeholder="Descripción (opcional)"
                value={description}
                variant="glass"
                style={styles.textArea}
              />
            </View>

            <View style={styles.toggleGroup}>
              <Body style={styles.label}>Dividir pagos entre jugadores</Body>
              <Caption style={styles.toggleHint}>
                Si activas esta opción, cada jugador pagará su parte. Si no, el organizador paga el total.
              </Caption>
              <Toggle value={isSplitPayment} onValueChange={setIsSplitPayment} />
            </View>
          </Card>

          {isSplitPayment && (
            <Card variant="glass" size="md" style={styles.infoCard}>
              <View style={styles.metaRow}>
                <Clock size={20} color={colors.primary} />
                <View>
                  <Body style={styles.metaLabel}>Deadline de pago</Body>
                  <H3 style={styles.metaValue}>
                    {deadline.toLocaleDateString('es-AR')} {deadline.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </H3>
                </View>
              </View>
              <Caption style={styles.infoText}>
                Los jugadores tienen hasta {businessRules.defaultSplitDeadlineHoursBeforeKickoff} horas antes del partido para pagar su parte.
              </Caption>
            </Card>
          )}

          <View style={styles.spacer} />
        </View>
      </ScrollView>

      <View style={styles.floatingCTA}>
        <Button
          disabled={isSubmitting}
          icon={<Trophy size={18} />}
          label={isSubmitting ? 'Creando partido...' : 'Abrir partido'}
          onPress={handleCreateMatch}
          variant="glow"
          size="lg"
          fullWidth
          loading={isSubmitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  infoCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  toggleGroup: {
    marginBottom: spacing.lg,
  },
  toggleHint: {
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metaLabel: {
    color: colors.textPrimary,
  },
  metaValue: {
    color: colors.primary,
  },
  spacer: {
    height: spacing.xl,
  },
  floatingCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
