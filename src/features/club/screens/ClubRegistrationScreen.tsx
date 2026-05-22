import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Building2, MapPin } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { clubsService } from '../../../data/services/clubs.service';
import { businessRules } from '../../../config/businessRules';
import { colors, spacing, typography } from '../../../theme/theme';

interface ClubRegistrationScreenProps {
  ownerId: string;
  onComplete: (clubId: string) => void;
  onCancel: () => void;
}

export function ClubRegistrationScreen({ ownerId, onComplete, onCancel }: ClubRegistrationScreenProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState<string>(businessRules.launchCity);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresa el nombre del club.');
      return;
    }

    if (!neighborhood.trim()) {
      Alert.alert('Barrio requerido', 'Por favor ingresa el barrio donde esta el club.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await clubsService.createClubProfile({
        owner_id: ownerId,
        name: name.trim(),
        address: address.trim() || undefined,
        neighborhood: neighborhood.trim(),
        city: city.trim(),
      });

      Alert.alert(
        'Club creado',
        'Tu club ha sido creado. Ahora puedes cargar tus canchas y solicitar aprobación.',
      );
      onComplete(result.clubId);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No pudimos crear el club.');
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
          <Text style={styles.title}>Crear perfil de club</Text>
          <View style={{ width: 40 }} />
        </View>

        <Card style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del club</Text>
            <View style={styles.inputWrapper}>
              <Building2 color={colors.muted} size={20} style={styles.inputIcon} />
              <TextInput
                autoCapitalize="words"
                onChangeText={setName}
                placeholder="Ej: La Docta Futbol"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={name}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección (opcional)</Text>
            <TextInput
              autoCapitalize="words"
              onChangeText={setAddress}
              placeholder="Calle y numero"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={address}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Barrio</Text>
            <View style={styles.inputWrapper}>
              <MapPin color={colors.muted} size={20} style={styles.inputIcon} />
              <TextInput
                autoCapitalize="words"
                onChangeText={setNeighborhood}
                placeholder="Ej: Nueva Córdoba"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={neighborhood}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ciudad</Text>
            <TextInput
              autoCapitalize="words"
              onChangeText={setCity}
              placeholder="Ciudad"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={city}
            />
          </View>

          <Button
            disabled={isSubmitting}
            label={isSubmitting ? 'Creando club...' : 'Crear club'}
            onPress={handleSubmit}
          />

          <Text style={styles.info}>
            Después de crear el club, podrás cargar tus canchas. El club quedar? en estado borrador hasta
            que solicites aprobacion.
          </Text>
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
  info: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 20,
    textAlign: 'center',
  },
});
