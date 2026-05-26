import { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, CheckCircle2, CreditCard, ImagePlus, X } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { courtsRepository } from '../../../data/repositories/courts.repository';
import { businessRules } from '../../../config/businessRules';
import { getErrorMessage } from '../../../lib/errors';
import { colors, spacing, typography } from '../../../theme/theme';
import type { CourtFormat, CourtSport, PaymentCollectionMode } from '../../../types/domain';

interface AddCourtScreenProps {
  clubId: string;
  onComplete: (court?: CreatedCourt) => void;
  onCancel: () => void;
}

export type CreatedCourt = {
  id: string;
  name: string;
  sport: CourtSport;
  format: CourtFormat;
  pricePerSlot: number;
  durationMinutes: number;
  paymentMode: PaymentCollectionMode;
  depositAmount: number;
  photos: string[];
};

const sportOptions: Array<{ label: string; value: CourtSport }> = [
  { label: 'Futbol', value: 'football' },
  { label: 'Padel', value: 'padel' },
];

const footballFormatOptions: Array<{ label: string; value: CourtFormat }> = [
  { label: '5v5', value: '5v5' },
  { label: '6v6', value: '6v6' },
  { label: '7v7', value: '7v7' },
  { label: '8v8', value: '8v8' },
  { label: '9v9', value: '9v9' },
  { label: '11v11', value: '11v11' },
  { label: 'Otro', value: 'other' },
];

const padelFormatOptions: Array<{ label: string; value: CourtFormat }> = [
  { label: '1v1', value: '1v1' },
  { label: '2v2', value: '2v2' },
];

const suggestedPlayersByFormat: Partial<Record<CourtFormat, string>> = {
  '5v5': '5',
  '6v6': '6',
  '7v7': '7',
  '8v8': '8',
  '9v9': '9',
  '11v11': '11',
  '1v1': '1',
  '2v2': '2',
};

export function AddCourtScreen({ clubId, onComplete, onCancel }: AddCourtScreenProps) {
  const [name, setName] = useState('');
  const [sport, setSport] = useState<CourtSport>('football');
  const [format, setFormat] = useState<CourtFormat>('7v7');
  const [playersPerTeam, setPlayersPerTeam] = useState('');
  const [pricePerSlot, setPricePerSlot] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(businessRules.defaultTurnDurationMinutes.toString());
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const paymentMode: PaymentCollectionMode = 'at_club';
  const formatOptions = sport === 'padel' ? padelFormatOptions : footballFormatOptions;

  useEffect(() => {
    if (sport === 'padel') {
      setFormat((current) => (current === '1v1' || current === '2v2' ? current : '2v2'));
      return;
    }

    setFormat((current) => {
      if (current === '1v1' || current === '2v2') {
        return '7v7';
      }
      return current;
    });
  }, [sport]);

  const selectFormat = (nextFormat: CourtFormat) => {
    setFormat(nextFormat);
    const suggested = suggestedPlayersByFormat[nextFormat];
    if (suggested) {
      setPlayersPerTeam((current) => (current.trim() ? current : suggested));
    }
  };

  const pickPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos para cargar imagenes de la cancha.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ['images'],
      quality: 0.8,
      selectionLimit: 6,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map((asset) => asset.uri);
      setPhotos((current) => [...current, ...selectedUris].slice(0, 6));
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos((current) => current.filter((photo) => photo !== uri));
  };

  const showPlayersHelp = () => {
    Alert.alert(
      'Jugadores por equipo',
      'Usalo si esta cancha permite jugar con mas o menos jugadores que el formato elegido. Por ejemplo, una cancha 5v5 donde tambien dejan jugar 6 por equipo.',
    );
  };

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
      Alert.alert('Precio invalido', 'El precio debe ser un numero mayor a 0.');
      return;
    }

    const duration = parseInt(durationMinutes, 10);
    if (isNaN(duration) || duration < 30) {
      Alert.alert('Duracion invalida', 'La duracion debe ser al menos 30 minutos.');
      return;
    }

    if (!clubId) {
      Alert.alert('Club no registrado', 'Completa el registro del club antes de agregar canchas.');
      return;
    }

    let playersPerTeamValue: number | undefined;
    if (playersPerTeam.trim()) {
      playersPerTeamValue = parseInt(playersPerTeam, 10);
      if (isNaN(playersPerTeamValue) || playersPerTeamValue < 1) {
        Alert.alert('Jugadores invalidos', 'Ingresa un numero valido de jugadores por equipo.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const created = await courtsRepository.createCourt({
        club_id: clubId,
        name: name.trim(),
        sport,
        format,
        players_per_team: playersPerTeamValue,
        price_per_slot: price,
        duration_minutes: duration,
        payment_mode: paymentMode,
        photos,
      });

      const newCourt: CreatedCourt = {
        id: created.id,
        name: created.name,
        sport: created.sport,
        format: created.format,
        pricePerSlot: Number(created.price_per_slot),
        durationMinutes: created.duration_minutes,
        paymentMode: created.payment_mode,
        depositAmount: created.deposit_amount ? Number(created.deposit_amount) : Math.round(price * 0.5),
        photos: created.photos ?? [],
      };

      Alert.alert('Cancha creada', 'La cancha ha sido agregada exitosamente.');
      onComplete(newCourt);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'No pudimos crear la cancha.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formBody = (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="always"
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
    >
          <View style={styles.header}>
            <Pressable onPress={onCancel} style={styles.backButton} accessibilityRole="button">
              <ArrowLeft color={colors.ink} size={20} />
            </Pressable>
            <View style={styles.headerText}>
              <Text style={styles.title}>Agregar cancha</Text>
              <Text style={styles.headerSubtitle}>Datos basicos, precio y fotos.</Text>
            </View>
          </View>

          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Info principal</Text>
              <Text style={styles.sectionStep}>1 de 3</Text>
            </View>

            <Input
              autofillMode="none"
              autoCapitalize="words"
              label="Titulo de la cancha"
              onChangeText={setName}
              placeholder="Ej: Cancha 1, Sintetico A"
              returnKeyType="next"
              value={name}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Deporte</Text>
              <View style={styles.formatGrid}>
                {sportOptions.map((option) => {
                  const selected = option.value === sport;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setSport(option.value)}
                      style={[styles.formatChip, selected && styles.formatChipSelected]}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.formatChipText, selected && styles.formatChipTextSelected]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Formato</Text>
              <View style={styles.formatGrid}>
                {formatOptions.map((option) => {
                  const selected = option.value === format;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => selectFormat(option.value)}
                      style={[styles.formatChip, selected && styles.formatChipSelected]}
                      accessibilityRole="button"
                    >
                      <Text style={[styles.formatChipText, selected && styles.formatChipTextSelected]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Jugadores por equipo</Text>
                <Pressable onPress={showPlayersHelp} style={styles.helpButton} accessibilityRole="button">
                  <Text style={styles.helpButtonText}>?</Text>
                </Pressable>
              </View>
              <Input
                autofillMode="none"
                keyboardType="number-pad"
                onChangeText={setPlayersPerTeam}
                placeholder={sport === 'padel' ? 'Ej: 2' : 'Ej: 5 para cancha 5v5'}
                value={playersPerTeam}
              />
              <Text style={styles.helperText}>
                Cantidad real por lado. Si es 5v5 flexible (5 o 6), pone el maximo permitido.
              </Text>
            </View>
          </Card>

          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fotos</Text>
              <Text style={styles.sectionStep}>{photos.length}/6</Text>
            </View>

            {photos.length === 0 ? (
              <Pressable onPress={pickPhotos} style={styles.emptyPhotoBox} accessibilityRole="button">
                <ImagePlus color={colors.primary} size={24} />
                <Text style={styles.emptyPhotoTitle}>Agregar fotos</Text>
                <Text style={styles.emptyPhotoText}>La primera imagen se usa como portada.</Text>
              </Pressable>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.photoRow}>
                  {photos.map((uri, index) => (
                    <View key={uri} style={styles.photoPreview}>
                      <Image source={{ uri }} style={styles.photoImage} />
                      {index === 0 && (
                        <View style={styles.coverBadge}>
                          <Text style={styles.coverBadgeText}>Portada</Text>
                        </View>
                      )}
                      <Pressable
                        onPress={() => removePhoto(uri)}
                        style={styles.removePhotoButton}
                        accessibilityRole="button"
                      >
                        <X color={colors.surface} size={14} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            <Button
              icon={<ImagePlus color={colors.ink} size={16} />}
              label={photos.length === 0 ? 'Elegir imagenes' : 'Agregar mas fotos'}
              onPress={pickPhotos}
              variant="secondary"
              fullWidth
            />
          </Card>

          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Precio y cobro</Text>
              <Text style={styles.sectionStep}>3 de 3</Text>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formColumn}>
                <Input
                  autofillMode="none"
                  keyboardType="decimal-pad"
                  label="Precio por turno"
                  onChangeText={setPricePerSlot}
                  placeholder="25000"
                  value={pricePerSlot}
                />
              </View>

              <View style={styles.formColumn}>
                <Input
                  autofillMode="none"
                  keyboardType="number-pad"
                  label="Minutos"
                  onChangeText={setDurationMinutes}
                  placeholder="60"
                  value={durationMinutes}
                />
              </View>
            </View>

            <View style={styles.paymentBox}>
              <View style={styles.paymentIcon}>
                <CreditCard color={colors.primary} size={20} />
              </View>
              <View style={styles.paymentText}>
                <Text style={styles.paymentTitle}>Pago en club</Text>
                <Text style={styles.paymentSubtitle}>
                  El jugador paga online solo la reserva. El turno completo se cobra en el club.
                </Text>
              </View>
              <CheckCircle2 color={colors.success} size={20} />
            </View>
          </Card>

          <Button
            disabled={isSubmitting}
            label={isSubmitting ? 'Creando cancha...' : 'Crear cancha'}
            onPress={handleSubmit}
            fullWidth
          />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
          {formBody}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.container}>{formBody}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionCard: {
    gap: spacing.lg,
    overflow: 'visible',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '800',
  },
  sectionStep: {
    color: colors.muted,
    fontSize: typography.tiny,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '700',
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  helpButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 9,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  helpButtonText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
  helperText: {
    color: colors.muted,
    fontSize: typography.tiny,
    fontWeight: '600',
    lineHeight: 16,
  },
  formatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  formatChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 42,
    minWidth: 72,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  formatChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  formatChipText: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '800',
  },
  formatChipTextSelected: {
    color: colors.surface,
  },
  emptyPhotoBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 132,
    padding: spacing.lg,
  },
  emptyPhotoTitle: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '800',
  },
  emptyPhotoText: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '600',
    textAlign: 'center',
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  photoPreview: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    height: 104,
    overflow: 'hidden',
    width: 138,
  },
  photoImage: {
    height: '100%',
    width: '100%',
  },
  coverBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    left: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    position: 'absolute',
    top: 6,
  },
  coverBadgeText: {
    color: colors.surface,
    fontSize: typography.tiny,
    fontWeight: '800',
  },
  removePhotoButton: {
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 6,
    top: 6,
    width: 28,
  },
  formRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formColumn: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  paymentBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  paymentIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  paymentText: {
    flex: 1,
  },
  paymentTitle: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '800',
  },
  paymentSubtitle: {
    color: colors.muted,
    fontSize: typography.tiny,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 2,
  },
});
