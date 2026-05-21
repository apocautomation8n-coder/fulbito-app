import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Clock, DollarSign, Users } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { courtsRepository } from '../../../data/repositories/courts.repository';
import { businessRules } from '../../../config/businessRules';
import { colors, spacing, typography } from '../../../theme/theme';
import type { CourtFormat, PaymentCollectionMode } from '../../../types/domain';

interface AddCourtScreenProps {
  clubId: string;
  onComplete: () => void;
  onCancel: () => void;
}

const formatOptions: Array<{ label: string; value: CourtFormat }> = [
  { label: '5v5', value: '5v5' },
  { label: '6v6', value: '6v6' },
  { label: '7v7', value: '7v7' },
  { label: '8v8', value: '8v8' },
  { label: '9v9', value: '9v9' },
  { label: '11v11', value: '11v11' },
  { label: 'Otro', value: 'other' },
];

const paymentModeOptions: Array<{ label: string; value: PaymentCollectionMode }> = [
  { label: 'Pago completo', value: 'full' },
  { label: 'Seña', value: 'deposit' },
];

export function AddCourtScreen({ clubId, onComplete, onCancel }: AddCourtScreenProps) {
  const [name, setName] = useState('');
  const [format, setFormat] = useState<CourtFormat>('7v7');
  const [playersPerTeam, setPlayersPerTeam] = useState('');
  const [pricePerSlot, setPricePerSlot] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(businessRules.defaultTurnDurationMinutes.toString());
  const [paymentMode, setPaymentMode] = useState<PaymentCollectionMode>('full');
  const [depositAmount, setDepositAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresa el nombre de la cancha.');
      return;
    }

    if (!pricePerSlot.trim()) {
      Alert.alert('Precio requerido', 'Por favor ingresa el precio por turno.');
      return;
    }

    const price = parseFloat(pricePerSlot);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Precio inválido', 'El precio debe ser un número mayor a 0.');
      return;
    }

    const duration = parseInt(durationMinutes, 10);
    if (isNaN(duration) || duration < 30) {
      Alert.alert('Duración inválida', 'La duración debe ser al menos 30 minutos.');
      return;
    }

    if (paymentMode === 'deposit') {
      if (!depositAmount.trim()) {
        Alert.alert('Seña requerida', 'Por favor ingresa el monto de la seña.');
        return;
      }
      const deposit = parseFloat(depositAmount);
      if (isNaN(deposit) || deposit <= 0 || deposit > price) {
        Alert.alert('Seña inválida', 'La seña debe ser mayor a 0 y menor o igual al precio total.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await courtsRepository.createCourt({
        club_id: clubId,
        name: name.trim(),
        format,
        players_per_team: playersPerTeam ? parseInt(playersPerTeam, 10) : undefined,
        price_per_slot: price,
        duration_minutes: duration,
        payment_mode: paymentMode,
        deposit_amount: paymentMode === 'deposit' ? parseFloat(depositAmount) : undefined,
      });

      Alert.alert('Cancha creada', 'La cancha ha sido agregada exitosamente.');
      onComplete();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No pudimos crear la cancha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Button icon={<ArrowLeft color={colors.ink} size={20} />} label="" onPress={onCancel} variant="ghost" />
          <Text style={styles.title}>Agregar cancha</Text>
          <View style={{ width: 40 }} />
        </View>

        <Card style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de la cancha</Text>
            <TextInput
              autoCapitalize="words"
              onChangeText={setName}
              placeholder="Ej: Cancha 1, Sintético A"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={name}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Formato</Text>
            <SegmentedControl options={formatOptions} value={format} onChange={setFormat} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Jugadores por equipo (opcional)</Text>
            <View style={styles.inputWrapper}>
              <Users color={colors.muted} size={20} style={styles.inputIcon} />
              <TextInput
                keyboardType="number-pad"
                onChangeText={setPlayersPerTeam}
                placeholder="Ej: 5"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={playersPerTeam}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Precio por turno (ARS)</Text>
            <View style={styles.inputWrapper}>
              <DollarSign color={colors.muted} size={20} style={styles.inputIcon} />
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={setPricePerSlot}
                placeholder="Ej: 25000"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={pricePerSlot}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duración del turno (minutos)</Text>
            <View style={styles.inputWrapper}>
              <Clock color={colors.muted} size={20} style={styles.inputIcon} />
              <TextInput
                keyboardType="number-pad"
                onChangeText={setDurationMinutes}
                placeholder="Ej: 60"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={durationMinutes}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Modo de cobro</Text>
            <SegmentedControl options={paymentModeOptions} value={paymentMode} onChange={setPaymentMode} />
          </View>

          {paymentMode === 'deposit' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Monto de la seña (ARS)</Text>
              <View style={styles.inputWrapper}>
                <DollarSign color={colors.muted} size={20} style={styles.inputIcon} />
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={setDepositAmount}
                  placeholder="Ej: 5000"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={depositAmount}
                />
              </View>
            </View>
          )}

          <Button
            disabled={isSubmitting}
            label={isSubmitting ? 'Creando cancha...' : 'Crear cancha'}
            onPress={handleSubmit}
          />
        </Card>
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
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
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
});
