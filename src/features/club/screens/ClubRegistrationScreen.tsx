import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Building2, MapPin } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { clubsService } from '../../../data/services/clubs.service';
import { businessRules } from '../../../config/businessRules';
import { Input } from '../../../components/ui/Input';
import { colors, spacing, typography, shadows } from '../../../theme/designSystem';

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
            <Input
              autoCapitalize="words"
              onChangeText={setName}
              placeholder="Ej: La Docta Futbol"
              value={name}
              variant="glass"
              label="Nombre del club"
              leftIcon={<Building2 color={colors.textTertiary} size={18} />}
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              autoCapitalize="words"
              onChangeText={setAddress}
              placeholder="Calle y numero"
              value={address}
              variant="glass"
              label="Direccion (opcional)"
              leftIcon={<MapPin color={colors.textTertiary} size={18} />}
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              autoCapitalize="words"
              onChangeText={setNeighborhood}
              placeholder="Ej: Nueva Cordoba"
              value={neighborhood}
              variant="glass"
              label="Barrio"
              leftIcon={<MapPin color={colors.textTertiary} size={18} />}
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              autoCapitalize="words"
              onChangeText={setCity}
              placeholder="Ciudad"
              value={city}
              variant="glass"
              label="Ciudad"
              leftIcon={<MapPin color={colors.textTertiary} size={18} />}
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
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
    gap: spacing.lg,
  },
  inputGroup: {
    marginBottom: 0,
  },
  info: {
    color: colors.textTertiary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
});
