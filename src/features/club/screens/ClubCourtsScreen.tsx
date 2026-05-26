import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Calendar, Clock, CreditCard, Edit3, ImagePlus, MapPin, Plus, X } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { AddCourtScreen, type CreatedCourt } from './AddCourtScreen';
import { CourtAvailabilityScreen } from './CourtAvailabilityScreen';
import { formatCurrency } from '../../../config/businessRules';
import { useAuth } from '../../../core/providers/AuthProvider';
import { courtsRepository } from '../../../data/repositories/courts.repository';
import { clubsService } from '../../../data/services/clubs.service';
import { colors, spacing, typography } from '../../../theme/theme';
import type { CourtFormat, CourtSport, PaymentCollectionMode } from '../../../types/domain';

type ClubCourt = {
  id: string;
  name: string;
  sport: CourtSport;
  format: CourtFormat;
  neighborhood: string;
  pricePerSlot: number;
  durationMinutes: number;
  paymentMode: PaymentCollectionMode;
  depositAmount: number;
  photos: string[];
};

const paymentModeOptions: Array<{ label: string; value: PaymentCollectionMode }> = [
  { label: 'Pago en club', value: 'at_club' },
];

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

const getSportLabel = (sport: CourtSport) => (sport === 'padel' ? 'Padel' : 'Futbol');
const getFormatLabel = (sport: CourtSport, format: CourtFormat) => (sport === 'padel' && format === 'other' ? '2v2' : format);

const mapRepoCourt = (court: Awaited<ReturnType<typeof courtsRepository.getClubCourts>>[number]): ClubCourt => ({
  id: court.id,
  name: court.name,
  sport: court.sport,
  format: court.format,
  neighborhood: 'Club',
  pricePerSlot: Number(court.price_per_slot),
  durationMinutes: court.duration_minutes,
  paymentMode: court.payment_mode,
  depositAmount: court.deposit_amount ? Number(court.deposit_amount) : 0,
  photos: court.photos ?? [],
});

export function ClubCourtsScreen() {
  const { user, isConfigured } = useAuth();
  const [showAddCourt, setShowAddCourt] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<{ id: string; name: string } | null>(null);
  const [clubId, setClubId] = useState<string | null>(null);
  const [courts, setCourts] = useState<ClubCourt[]>([]);

  useEffect(() => {
    if (!user?.id || !isConfigured) return;

    clubsService.getClubByOwner(user.id).then(async (club) => {
      if (!club) return;
      setClubId(club.id);
      const rows = await courtsRepository.getClubCourts(club.id);
      setCourts(rows.map(mapRepoCourt));
    });
  }, [isConfigured, user?.id]);
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [editSport, setEditSport] = useState<CourtSport>('football');
  const [editFormat, setEditFormat] = useState<CourtFormat>('7v7');
  const [editPricePerSlot, setEditPricePerSlot] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editPaymentMode, setEditPaymentMode] = useState<PaymentCollectionMode>('at_club');
  const [editDepositAmount, setEditDepositAmount] = useState('');
  const [editPhotos, setEditPhotos] = useState<string[]>([]);

  const handleCourtCreated = (court?: CreatedCourt) => {
    if (court) {
      setCourts((current) => [
        {
          id: court.id,
          name: court.name,
          sport: court.sport,
          format: court.format,
          neighborhood: 'Club',
          pricePerSlot: court.pricePerSlot,
          durationMinutes: court.durationMinutes,
          paymentMode: court.paymentMode,
          depositAmount: court.depositAmount,
          photos: court.photos,
        },
        ...current,
      ]);
    }

    setShowAddCourt(false);
  };

  const startEditCourt = (court: ClubCourt) => {
    setEditingCourtId(court.id);
    setEditSport(court.sport);
    setEditFormat(court.format);
    setEditPricePerSlot(court.pricePerSlot.toString());
    setEditDuration(court.durationMinutes.toString());
    setEditPaymentMode(court.paymentMode);
    setEditDepositAmount(court.depositAmount.toString());
    setEditPhotos(court.photos);
  };

  const cancelEditCourt = () => {
    setEditingCourtId(null);
    setEditSport('football');
    setEditFormat('7v7');
    setEditPricePerSlot('');
    setEditDuration('');
    setEditPaymentMode('at_club');
    setEditDepositAmount('');
    setEditPhotos([]);
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
      setEditPhotos((current) => [...current, ...selectedUris].slice(0, 6));
    }
  };

  const removeEditPhoto = (uri: string) => {
    setEditPhotos((current) => current.filter((photo) => photo !== uri));
  };

  const saveEditCourt = () => {
    if (!editingCourtId) return;

    const price = parseFloat(editPricePerSlot);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Precio invalido', 'El precio por turno debe ser mayor a 0.');
      return;
    }

    const duration = parseInt(editDuration, 10);
    if (isNaN(duration) || duration < 30) {
      Alert.alert('Duracion invalida', 'La duracion del turno debe ser de al menos 30 minutos.');
      return;
    }

    const deposit = parseFloat(editDepositAmount);
    if (
      editPaymentMode === 'deposit' &&
      (isNaN(deposit) || deposit <= 0 || deposit > price)
    ) {
      Alert.alert('Anticipo invalido', 'El anticipo debe ser mayor a 0 y menor o igual al precio total.');
      return;
    }

    setCourts((current) =>
      current.map((court) =>
        court.id === editingCourtId
          ? {
              ...court,
              sport: editSport,
              format: editSport === 'padel' && editFormat === 'other' ? '2v2' : editFormat,
              pricePerSlot: price,
              durationMinutes: duration,
              paymentMode: editPaymentMode,
              depositAmount: editPaymentMode === 'deposit' ? deposit : Math.round(price * 0.5),
              photos: editPhotos,
            }
          : court,
      ),
    );
    cancelEditCourt();
    Alert.alert('Cancha actualizada', 'Los cambios quedaron guardados.');
  };

  if (showAddCourt) {
    return (
      <AddCourtScreen
        clubId={clubId ?? ''}
        onComplete={handleCourtCreated}
        onCancel={() => setShowAddCourt(false)}
      />
    );
  }

  if (showAvailability && selectedCourt) {
    return (
      <CourtAvailabilityScreen
        courtId={selectedCourt.id}
        courtName={selectedCourt.name}
        onComplete={() => {
          setShowAvailability(false);
          setSelectedCourt(null);
        }}
        onCancel={() => {
          setShowAvailability(false);
          setSelectedCourt(null);
        }}
      />
    );
  }

  return (
    <Screen title="Canchas" subtitle="Formatos, precios, duracion y disponibilidad.">
      <Button
        icon={<Plus color={colors.surface} size={18} />}
        label="Agregar cancha"
        onPress={() => {
          if (!clubId) {
            Alert.alert(
              'Registra tu club',
              'Completa el perfil y registro del club antes de agregar canchas.',
            );
            return;
          }
          setShowAddCourt(true);
        }}
      />

      {courts.map((court) => {
        const isEditing = editingCourtId === court.id;

        return (
          <Card key={court.id} style={styles.card}>
            <View style={styles.header}>
              {court.photos[0] && (
                <Image source={{ uri: court.photos[0] }} style={styles.coverImage} />
              )}
              <View style={styles.headerText}>
                <Text style={styles.title}>{court.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin color={colors.muted} size={14} />
                  <Text style={styles.locationText}>{court.neighborhood}</Text>
                </View>
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.price}>{formatCurrency(court.pricePerSlot)}</Text>
                <Text style={styles.priceLabel}>por turno</Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailPill}>
                <Text style={styles.detailLabel}>Deporte</Text>
                <Text style={styles.detailValue}>{getSportLabel(court.sport)}</Text>
              </View>
              <View style={styles.detailPill}>
                <Text style={styles.detailLabel}>Formato</Text>
                <Text style={styles.detailValue}>{getFormatLabel(court.sport, court.format)}</Text>
              </View>
              <View style={styles.detailPill}>
                <Clock color={colors.primary} size={15} />
                <Text style={styles.detailValue}>{court.durationMinutes} min</Text>
              </View>
              <View style={styles.detailPillWide}>
                <CreditCard color={colors.primary} size={15} />
                <Text style={styles.detailValue}>
                  Pago en club
                </Text>
              </View>
            </View>

            {isEditing && (
              <View style={styles.editor}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Deporte</Text>
                  <View style={styles.chipGrid}>
                    {sportOptions.map((option) => {
                      const selected = editSport === option.value;

                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => {
                            setEditSport(option.value);
                            if (option.value === 'padel') {
                              setEditFormat('2v2');
                            } else if (editFormat === 'other' || editFormat === '1v1' || editFormat === '2v2') {
                              setEditFormat('7v7');
                            }
                          }}
                          style={[styles.editChip, selected && styles.editChipSelected]}
                          accessibilityRole="button"
                        >
                          <Text style={[styles.editChipText, selected && styles.editChipTextSelected]}>
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Formato</Text>
                  <View style={styles.chipGrid}>
                    {(editSport === 'padel' ? padelFormatOptions : footballFormatOptions).map((option) => {
                      const selected = editFormat === option.value;

                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => setEditFormat(option.value)}
                          style={[styles.editChip, selected && styles.editChipSelected]}
                          accessibilityRole="button"
                        >
                          <Text style={[styles.editChipText, selected && styles.editChipTextSelected]}>
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Precio por turno</Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    onChangeText={setEditPricePerSlot}
                    placeholder="Ej: 28000"
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                    value={editPricePerSlot}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Duracion del turno</Text>
                  <TextInput
                    keyboardType="number-pad"
                    onChangeText={setEditDuration}
                    placeholder="60"
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                    value={editDuration}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Modo de cobro</Text>
                  <SegmentedControl
                    options={paymentModeOptions}
                    value={editPaymentMode}
                    onChange={setEditPaymentMode}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Fotos de la cancha</Text>
                  <Button
                    icon={<ImagePlus color={colors.ink} size={16} />}
                    label="Agregar fotos"
                    onPress={pickPhotos}
                    variant="secondary"
                    size="sm"
                  />
                  {editPhotos.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.photoRow}>
                        {editPhotos.map((uri) => (
                          <View key={uri} style={styles.photoPreview}>
                            <Image source={{ uri }} style={styles.photoImage} />
                            <Pressable
                              onPress={() => removeEditPhoto(uri)}
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
                  <Text style={styles.helperText}>Hasta 6 imagenes.</Text>
                </View>

                {editPaymentMode === 'deposit' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Monto de anticipo</Text>
                    <TextInput
                      keyboardType="decimal-pad"
                      onChangeText={setEditDepositAmount}
                      placeholder="Ej: 10000"
                      placeholderTextColor={colors.muted}
                      style={styles.input}
                      value={editDepositAmount}
                    />
                  </View>
                )}

                <View style={styles.editorActions}>
                  <Button label="Guardar" onPress={saveEditCourt} style={styles.actionButton} size="sm" />
                  <Button
                    label="Cancelar"
                    onPress={cancelEditCourt}
                    style={styles.actionButton}
                    variant="secondary"
                    size="sm"
                  />
                </View>
              </View>
            )}

            <View style={styles.footer}>
              <View style={styles.meta}>
                <View style={styles.statusDot} />
                <Text style={styles.metaText}>Visible para jugadores</Text>
              </View>
              <View style={styles.actions}>
                <Button
                  icon={<Calendar color={colors.ink} size={16} />}
                  label="Horarios"
                  onPress={() => {
                    setSelectedCourt({ id: court.id, name: court.name });
                    setShowAvailability(true);
                  }}
                  style={styles.actionButton}
                  variant="secondary"
                />
                <Button
                  icon={<Edit3 color={colors.ink} size={16} />}
                  label={isEditing ? 'Editando' : 'Editar'}
                  onPress={() => (isEditing ? cancelEditCourt() : startEditCourt(court))}
                  style={styles.actionButton}
                  variant="secondary"
                />
              </View>
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.md,
  },
  coverImage: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    width: '100%',
  },
  headerText: {
    gap: spacing.xs,
  },
  title: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  locationText: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '600',
  },
  priceBox: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  price: {
    color: colors.primaryDark,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  priceLabel: {
    color: colors.muted,
    fontSize: typography.tiny,
    fontWeight: '700',
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailPill: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  detailPillWide: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  detailLabel: {
    color: colors.muted,
    fontSize: typography.tiny,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: colors.ink,
    flexShrink: 1,
    fontSize: typography.small,
    fontWeight: '800',
  },
  footer: {
    gap: spacing.md,
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statusDot: {
    backgroundColor: colors.success,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  metaText: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flexBasis: 0,
    flexGrow: 1,
    minWidth: 0,
  },
  editor: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.md,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  editChip: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 40,
    minWidth: 72,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  editChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  editChipText: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '800',
  },
  editChipTextSelected: {
    color: colors.surface,
  },
  label: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: typography.body,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  helperText: {
    color: colors.muted,
    fontSize: typography.tiny,
    fontWeight: '600',
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  photoPreview: {
    borderRadius: 8,
    height: 82,
    overflow: 'hidden',
    width: 110,
  },
  photoImage: {
    height: '100%',
    width: '100%',
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
  editorActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
