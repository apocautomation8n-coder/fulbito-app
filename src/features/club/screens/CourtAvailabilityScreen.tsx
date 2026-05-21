import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Calendar, Clock, Plus, Trash2 } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { bookingsRepository } from '../../../data/repositories/bookings.repository';
import { businessRules } from '../../../config/businessRules';
import { colors, spacing, typography } from '../../../theme/theme';

interface CourtAvailabilityScreenProps {
  courtId: string;
  courtName: string;
  onComplete: () => void;
  onCancel: () => void;
}

interface TimeSlotInput {
  date: string;
  startTime: string;
  endTime: string;
}

export function CourtAvailabilityScreen({ courtId, courtName, onComplete, onCancel }: CourtAvailabilityScreenProps) {
  const [slots, setSlots] = useState<TimeSlotInput[]>([
    { date: '', startTime: '', endTime: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSlot = () => {
    setSlots([...slots, { date: '', startTime: '', endTime: '' }]);
  };

  const removeSlot = (index: number) => {
    if (slots.length > 1) {
      setSlots(slots.filter((_, i) => i !== index));
    }
  };

  const updateSlot = (index: number, field: keyof TimeSlotInput, value: string) => {
    const newSlots = [...slots];
    newSlots[index][field] = value;
    setSlots(newSlots);
  };

  const handleSubmit = async () => {
    const validSlots = slots.filter(slot => slot.date && slot.startTime && slot.endTime);

    if (validSlots.length === 0) {
      Alert.alert('Sin horarios', 'Por favor agrega al menos un horario válido.');
      return;
    }

    for (const slot of validSlots) {
      if (!slot.startTime || !slot.endTime) {
        Alert.alert('Horario incompleto', 'Todos los horarios deben tener hora de inicio y fin.');
        return;
      }

      if (slot.startTime >= slot.endTime) {
        Alert.alert('Horario inválido', 'La hora de fin debe ser posterior a la hora de inicio.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      for (const slot of validSlots) {
        const startTime = new Date(`${slot.date}T${slot.startTime}`);
        const endTime = new Date(`${slot.date}T${slot.endTime}`);

        await bookingsRepository.createTimeSlot(
          courtId,
          startTime.toISOString(),
          endTime.toISOString(),
        );
      }

      Alert.alert('Horarios cargados', `${validSlots.length} horario(s) agregado(s) exitosamente.`);
      onComplete();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No pudimos cargar los horarios.');
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
          <Text style={styles.title}>Disponibilidad</Text>
          <View style={{ width: 40 }} />
        </View>

        <Card style={styles.infoCard}>
          <Text style={styles.courtName}>{courtName}</Text>
          <Text style={styles.infoText}>
            Agrega los horarios disponibles para reservas. Los jugadores podrán reservar estos turnos.
          </Text>
        </Card>

        {slots.map((slot, index) => (
          <Card key={index} style={styles.slotCard}>
            <View style={styles.slotHeader}>
              <Text style={styles.slotTitle}>Turno {index + 1}</Text>
              {slots.length > 1 && (
                <Button
                  icon={<Trash2 color={colors.danger} size={16} />}
                  label=""
                  onPress={() => removeSlot(index)}
                  variant="ghost"
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha</Text>
              <View style={styles.inputWrapper}>
                <Calendar color={colors.muted} size={20} style={styles.inputIcon} />
                <TextInput
                  keyboardType="numbers-and-punctuation"
                  onChangeText={(value) => updateSlot(index, 'date', value)}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={slot.date}
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
                    onChangeText={(value) => updateSlot(index, 'startTime', value)}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                    value={slot.startTime}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.half]}>
                <Text style={styles.label}>Fin</Text>
                <View style={styles.inputWrapper}>
                  <Clock color={colors.muted} size={20} style={styles.inputIcon} />
                  <TextInput
                    keyboardType="numbers-and-punctuation"
                    onChangeText={(value) => updateSlot(index, 'endTime', value)}
                    placeholder="HH:MM"
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                    value={slot.endTime}
                  />
                </View>
              </View>
            </View>
          </Card>
        ))}

        <Button
          icon={<Plus color={colors.primary} size={18} />}
          label="Agregar otro turno"
          onPress={addSlot}
          variant="secondary"
        />

        <Button
          disabled={isSubmitting}
          label={isSubmitting ? 'Guardando...' : 'Guardar horarios'}
          onPress={handleSubmit}
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
  slotCard: {
    gap: spacing.md,
  },
  slotHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slotTitle: {
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
});
