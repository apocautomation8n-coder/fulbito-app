import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Building2,
  ChevronRight,
  DollarSign,
  Edit2,
  LogOut,
  MapPin,
  Save,
  Send,
  Settings,
  Shield,
  X,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { useAuth } from '../../../core/providers/AuthProvider';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { clubsService } from '../../../data/services/clubs.service';
import type { Club } from '../../../data/repositories/clubs.repository';
import { businessRules, formatPercent } from '../../../config/businessRules';
import { company } from '../../../config/company';
import { colors, spacing, borderRadius } from '../../../theme/designSystem';
import type { ClubVerificationStatus } from '../../../types/domain';

const AnimatedView = Animated.createAnimatedComponent(View);

type ClubProfileForm = {
  name: string;
  address: string;
  neighborhood: string;
  city: string;
};

const demoClubProfile: ClubProfileForm = {
  name: 'Club Demo',
  address: 'Av. Principal 123',
  neighborhood: 'Barrio Centro',
  city: businessRules.launchCity,
};

const toForm = (club: Club | null, fallbackName: string): ClubProfileForm => ({
  name: club?.name ?? fallbackName,
  address: club?.address ?? '',
  neighborhood: club?.neighborhood ?? '',
  city: club?.city ?? businessRules.launchCity,
});

export function ClubProfileScreen() {
  const { isConfigured, signOut, user } = useAuth();
  const [clubId, setClubId] = useState('demo-club');
  const [clubProfile, setClubProfile] = useState<ClubProfileForm>(demoClubProfile);
  const [profileForm, setProfileForm] = useState<ClubProfileForm>(demoClubProfile);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<ClubVerificationStatus>('draft');

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withSequence(withDelay(0, withSpring(1, { damping: 15, stiffness: 400 })));
    translateY.value = withSequence(withDelay(0, withSpring(0, { damping: 15, stiffness: 400 })));
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    let active = true;

    const loadClubProfile = async () => {
      if (!user || !isConfigured) {
        const fallbackProfile = {
          ...demoClubProfile,
          name: user?.fullName ?? demoClubProfile.name,
        };
        setClubProfile(fallbackProfile);
        setProfileForm(fallbackProfile);
        setVerificationStatus(user?.clubVerificationStatus ?? 'pending');
        return;
      }

      try {
        const club = await clubsService.getClubByOwner(user.id);
        if (!active) return;

        if (club) {
          const nextProfile = toForm(club, user.fullName);
          setClubId(club.id);
          setClubProfile(nextProfile);
          setProfileForm(nextProfile);
          setVerificationStatus(club.verification_status);
        } else {
          const fallbackProfile = {
            ...demoClubProfile,
            name: user.fullName,
          };
          setClubProfile(fallbackProfile);
          setProfileForm(fallbackProfile);
          setVerificationStatus(user.clubVerificationStatus ?? 'draft');
        }
      } catch (error) {
        if (!active) return;
        Alert.alert('Error', 'No pudimos cargar los datos del club.');
      }
    };

    loadClubProfile();

    return () => {
      active = false;
    };
  }, [isConfigured, user]);

  const updateFormField = (field: keyof ClubProfileForm, value: string) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const openEditProfile = () => {
    setProfileForm(clubProfile);
    setIsEditOpen(true);
  };

  const handleSaveProfile = async () => {
    const nextProfile = {
      name: profileForm.name.trim(),
      address: profileForm.address.trim(),
      neighborhood: profileForm.neighborhood.trim(),
      city: profileForm.city.trim(),
    };

    if (!nextProfile.name) {
      Alert.alert('Nombre requerido', 'Ingresa el nombre del club.');
      return;
    }

    if (!nextProfile.neighborhood) {
      Alert.alert('Barrio requerido', 'Ingresa el barrio del club.');
      return;
    }

    if (!nextProfile.city) {
      Alert.alert('Ciudad requerida', 'Ingresa la ciudad del club.');
      return;
    }

    setIsSavingProfile(true);
    try {
      if (isConfigured) {
        await clubsService.updateClubProfile(clubId, {
          name: nextProfile.name,
          address: nextProfile.address || null,
          neighborhood: nextProfile.neighborhood,
          city: nextProfile.city,
        });
      }

      setClubProfile(nextProfile);
      setIsEditOpen(false);
      Alert.alert('Perfil actualizado', 'Los datos del club fueron guardados.');
    } catch (error) {
      Alert.alert('Error', 'No pudimos guardar los datos del club.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSubmitForApproval = async () => {
    Alert.alert(
      'Solicitar aprobacion',
      'Quieres solicitar la aprobacion de tu club? Una vez aprobado, podras recibir reservas online.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: async () => {
            try {
              if (isConfigured) {
                await clubsService.submitClubForApproval(clubId);
              }
              setVerificationStatus('pending');
              Alert.alert('Solicitud enviada', 'Tu solicitud de aprobacion ha sido enviada.');
            } catch (error) {
              Alert.alert('Error', 'No pudimos enviar la solicitud.');
            }
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      'Estas seguro de que quieres eliminar tu cuenta? Esta accion no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Funcionalidad pendiente', 'La eliminacion de cuenta se implementara pronto.');
          },
        },
      ],
    );
  };

  const getStatusVariant = () => {
    switch (verificationStatus) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'approved':
        return 'Verificado';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazado';
      case 'suspended':
        return 'Bloqueado';
      default:
        return 'Borrador';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AnimatedView style={[styles.body, animatedStyle]}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Building2 color={colors.background} size={28} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.clubName}>{clubProfile.name}</Text>
            <Text style={styles.clubMeta}>{clubProfile.neighborhood || 'Perfil de club'}</Text>
          </View>
          <Badge label={getStatusText()} variant={getStatusVariant()} size="sm" />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Users size={20} color={colors.primary} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Jugadores</Text>
          </View>
          <View style={styles.statBox}>
            <DollarSign size={20} color={colors.accent} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Reservas</Text>
          </View>
          <View style={styles.statBox}>
            <TrendingUp size={20} color={colors.warning} />
            <Text style={styles.statValue}>0%</Text>
            <Text style={styles.statLabel}>Ocupacion</Text>
          </View>
        </View>

        <Card variant="elevated" size="lg" style={styles.card}>
          <Text style={styles.sectionTitle}>Estado operativo</Text>
          <View style={styles.noticeBox}>
            <Shield size={20} color={colors.primary} />
            <View style={styles.noticeText}>
              <Text style={styles.noticeTitle}>Reservas online</Text>
              <Text style={styles.noticeSubtitle}>
                El club puede recibir reservas cuando este aprobado. La reserva online la cobra Fulbito.
              </Text>
            </View>
          </View>
        </Card>

        <Card variant="elevated" size="lg" style={styles.card}>
          <Text style={styles.sectionTitle}>Informacion del club</Text>
          <Pressable style={styles.item} onPress={openEditProfile}>
            <View style={styles.itemLeft}>
              <Edit2 size={20} color={colors.textPrimary} />
              <Text style={styles.itemText}>Editar perfil</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </Pressable>
          <View style={styles.itemLast}>
            <View style={styles.itemLeft}>
              <MapPin size={20} color={colors.textPrimary} />
              <View style={styles.itemTextBlock}>
                <Text style={styles.itemText}>Direccion</Text>
                <Text style={styles.itemSubtext}>
                  {clubProfile.address || 'Sin direccion'} · {clubProfile.neighborhood || 'Sin barrio'} · {clubProfile.city}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card variant="elevated" size="lg" style={styles.card}>
          <Text style={styles.sectionTitle}>Cierre mensual</Text>
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <DollarSign size={20} color={colors.textPrimary} />
              <Text style={styles.itemText}>Comision club</Text>
            </View>
            <Badge label={formatPercent(businessRules.clubMonthlyCommissionRate)} variant="accent" size="sm" />
          </View>
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <Settings size={20} color={colors.textPrimary} />
              <Text style={styles.itemText}>Link mensual</Text>
            </View>
            <Badge label="Dia 1" variant="accent" size="sm" />
          </View>
          <View style={styles.itemLast}>
            <View style={styles.itemLeft}>
              <Shield size={20} color={colors.textPrimary} />
              <Text style={styles.itemText}>Bloqueo por deuda</Text>
            </View>
            <Badge label={`${businessRules.clubBillingPaymentWindowDays} dias`} variant="warning" size="sm" />
          </View>
        </Card>

        <Card variant="elevated" size="lg" style={styles.card}>
          <Text style={styles.sectionTitle}>Verificacion</Text>
          {verificationStatus === 'draft' && (
            <View style={styles.verifyBlock}>
              <Text style={styles.verifyText}>
                Solicita revision cuando el perfil y las canchas esten cargadas.
              </Text>
              <Button
                icon={<Send size={18} />}
                label="Solicitar aprobacion"
                onPress={handleSubmitForApproval}
                variant="primary"
                size="md"
                fullWidth
              />
            </View>
          )}
          {verificationStatus === 'pending' && (
            <View style={styles.itemLast}>
              <View style={styles.itemLeft}>
                <Shield size={20} color={colors.warning} />
                <Text style={styles.itemText}>Solicitud en revision</Text>
              </View>
            </View>
          )}
          {verificationStatus === 'approved' && (
            <View style={styles.itemLast}>
              <View style={styles.itemLeft}>
                <Shield size={20} color={colors.accent} />
                <Text style={styles.itemText}>Club verificado</Text>
              </View>
            </View>
          )}
          {verificationStatus === 'rejected' && (
            <View style={styles.itemLast}>
              <View style={styles.itemLeft}>
                <Shield size={20} color={colors.danger} />
                <Text style={styles.itemText}>Solicitud rechazada</Text>
              </View>
            </View>
          )}
        </Card>

        <Card variant="elevated" size="lg" style={styles.card}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <Pressable style={styles.itemLast} onPress={handleDeleteAccount}>
            <View style={styles.itemLeft}>
              <Trash2 size={20} color={colors.danger} />
              <Text style={[styles.itemText, styles.dangerText]}>Eliminar cuenta</Text>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </Pressable>
        </Card>

        <View style={styles.supportBox}>
          <Text style={styles.supportTitle}>Soporte</Text>
          <Text style={styles.supportText}>{company.supportEmail}</Text>
          <Text style={styles.supportText}>{company.website}</Text>
          <Text style={styles.supportText}>{company.copyright}</Text>
        </View>

        <Button
          icon={<LogOut size={18} />}
          label="Salir"
          onPress={signOut}
          variant="secondary"
          size="lg"
          fullWidth
        />
        </AnimatedView>
      </ScrollView>

      <Modal visible={isEditOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: 'padding', android: undefined })}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalHeader}>
              <Pressable style={styles.iconButton} onPress={() => setIsEditOpen(false)}>
                <X size={22} color={colors.textPrimary} />
              </Pressable>
              <View style={styles.modalTitleBlock}>
                <Text style={styles.modalTitle}>Editar club</Text>
                <Text style={styles.modalSubtitle}>Datos visibles para jugadores</Text>
              </View>
              <View style={styles.iconButtonPlaceholder} />
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Nombre del club</Text>
                <TextInput
                  autoCapitalize="words"
                  onChangeText={(value) => updateFormField('name', value)}
                  placeholder="Ej: Club Demo"
                  placeholderTextColor={colors.textTertiary}
                  style={styles.input}
                  value={profileForm.name}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Direccion</Text>
                <TextInput
                  autoCapitalize="words"
                  onChangeText={(value) => updateFormField('address', value)}
                  placeholder="Calle y numero"
                  placeholderTextColor={colors.textTertiary}
                  style={styles.input}
                  value={profileForm.address}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Barrio</Text>
                <TextInput
                  autoCapitalize="words"
                  onChangeText={(value) => updateFormField('neighborhood', value)}
                  placeholder="Barrio"
                  placeholderTextColor={colors.textTertiary}
                  style={styles.input}
                  value={profileForm.neighborhood}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Ciudad</Text>
                <TextInput
                  autoCapitalize="words"
                  onChangeText={(value) => updateFormField('city', value)}
                  placeholder="Ciudad"
                  placeholderTextColor={colors.textTertiary}
                  style={styles.input}
                  value={profileForm.city}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                label="Cancelar"
                onPress={() => setIsEditOpen(false)}
                variant="secondary"
                size="lg"
                fullWidth
              />
              <Button
                disabled={isSavingProfile}
                icon={<Save size={18} />}
                label={isSavingProfile ? 'Guardando...' : 'Guardar cambios'}
                onPress={handleSaveProfile}
                variant="primary"
                size="lg"
                fullWidth
              />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  body: {
    gap: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  headerText: {
    flex: 1,
  },
  clubName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  clubMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 96,
    padding: spacing.md,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  noticeBox: {
    alignItems: 'flex-start',
    backgroundColor: colors.cardLight,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  noticeText: {
    flex: 1,
  },
  noticeTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  noticeSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 4,
  },
  item: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingVertical: spacing.sm,
  },
  itemLast: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingVertical: spacing.sm,
  },
  itemLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  itemText: {
    color: colors.textPrimary,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  itemTextBlock: {
    flex: 1,
    gap: 3,
  },
  itemSubtext: {
    color: colors.textSecondary,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  verifyBlock: {
    gap: spacing.md,
  },
  verifyText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  dangerText: {
    color: colors.danger,
  },
  supportBox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  supportTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  supportText: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  modalContainer: {
    backgroundColor: colors.background,
    flex: 1,
  },
  modalKeyboard: {
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconButtonPlaceholder: {
    width: 44,
  },
  modalTitleBlock: {
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  modalContent: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  formGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  modalActions: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
});
