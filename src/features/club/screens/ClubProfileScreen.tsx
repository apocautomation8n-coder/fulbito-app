import { useState, useEffect } from 'react';
import { Alert, Pressable, StyleSheet, ScrollView, View } from 'react-native';
import { Building2, ChevronRight, CreditCard, Edit2, Home, LogOut, MapPin, Send, Settings, Shield, Trash2, TrendingUp, Users, DollarSign } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

import { useAuth } from '../../../core/providers/AuthProvider';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { H1, H3, H4, Body, Caption } from '../../../components/ui/Typography';
import { clubsService } from '../../../data/services/clubs.service';
import { businessRules } from '../../../config/businessRules';
import { company } from '../../../config/company';
import { colors, spacing } from '../../../theme/designSystem';

const AnimatedView = Animated.createAnimatedComponent(View);

export function ClubProfileScreen() {
  const { signOut, user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'draft' | 'pending' | 'approved' | 'rejected'>('draft');

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withSequence(
      withDelay(0, withSpring(1, { damping: 15, stiffness: 400 })),
    );
    translateY.value = withSequence(
      withDelay(0, withSpring(0, { damping: 15, stiffness: 400 })),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleSubmitForApproval = async () => {
    Alert.alert(
      'Solicitar aprobación',
      '¿Estás seguro de que quieres solicitar la aprobación de tu club? Una vez aprobado, podrás recibir pagos online.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar',
          onPress: async () => {
            try {
              await clubsService.submitClubForApproval('demo-club');
              setVerificationStatus('pending');
              Alert.alert('Solicitud enviada', 'Tu solicitud de aprobación ha sido enviada.');
            } catch (error) {
              Alert.alert('Error', 'No pudimos enviar la solicitud.');
            }
          },
        },
      ],
    );
  };

  const handleConnectMercadoPago = () => {
    Alert.alert(
      'Conectar MercadoPago',
      'Para conectar MercadoPago necesitas una cuenta de MercadoPago Marketplace. Contacta a soporte para obtener acceso.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Contactar soporte', onPress: () => {} },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Funcionalidad pendiente', 'La eliminación de cuenta se implementará pronto.');
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
      default:
        return 'Borrador';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AnimatedView style={animatedStyle}>
        <Card variant="gradient" size="lg" style={styles.profileCard}>
          <View style={styles.iconWrap}>
            <Building2 color={colors.background} size={32} />
          </View>
          <View style={styles.textBlock}>
            <H1 style={styles.title}>{user?.fullName}</H1>
            <Badge label={getStatusText()} variant={getStatusVariant()} />
          </View>
        </Card>

        <View style={styles.statsRow}>
          <Card variant="glass" size="md" style={styles.statCard}>
            <Users size={24} color={colors.primary} />
            <H3 style={styles.statValue}>0</H3>
            <Caption>Jugadores</Caption>
          </Card>
          <Card variant="glass" size="md" style={styles.statCard}>
            <DollarSign size={24} color={colors.accent} />
            <H3 style={styles.statValue}>0</H3>
            <Caption>Reservas</Caption>
          </Card>
          <Card variant="glass" size="md" style={styles.statCard}>
            <TrendingUp size={24} color={colors.warning} />
            <H3 style={styles.statValue}>0%</H3>
            <Caption>Ocupación</Caption>
          </Card>
        </View>

        <Card variant="elevated" size="lg" style={styles.listCard}>
          <H4 style={styles.sectionTitle}>Información del club</H4>
          <Pressable style={styles.item}>
            <View style={styles.itemLeft}>
              <Edit2 size={20} color={colors.textPrimary} />
              <Body>Editar perfil</Body>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </Pressable>
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <MapPin size={20} color={colors.textPrimary} />
              <Body>Dirección</Body>
            </View>
            <Badge label="Pendiente" variant="default" size="sm" />
          </View>
        </Card>

        <Card variant="elevated" size="lg" style={styles.listCard}>
          <H4 style={styles.sectionTitle}>Configuración</H4>
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <Settings size={20} color={colors.textPrimary} />
              <Body>Deadline split</Body>
            </View>
            <Badge label={`${businessRules.defaultSplitDeadlineHoursBeforeKickoff}h`} variant="accent" size="sm" />
          </View>
          <Pressable style={styles.item} onPress={handleConnectMercadoPago}>
            <View style={styles.itemLeft}>
              <CreditCard size={20} color={colors.textPrimary} />
              <Body>MercadoPago</Body>
            </View>
            <Badge label="No conectado" variant="warning" size="sm" />
          </Pressable>
        </Card>

        <Card variant="elevated" size="lg" style={styles.listCard}>
          <H4 style={styles.sectionTitle}>Verificación</H4>
          {verificationStatus === 'draft' && (
            <Button
              icon={<Send size={18} />}
              label="Solicitar aprobación"
              onPress={handleSubmitForApproval}
              variant="primary"
              size="md"
              fullWidth
            />
          )}
          {verificationStatus === 'pending' && (
            <View style={styles.item}>
              <View style={styles.itemLeft}>
                <Shield size={20} color={colors.warning} />
                <Body>Solicitud en revisión</Body>
              </View>
            </View>
          )}
          {verificationStatus === 'approved' && (
            <View style={styles.item}>
              <View style={styles.itemLeft}>
                <Shield size={20} color={colors.accent} />
                <Body>Club verificado</Body>
              </View>
            </View>
          )}
          {verificationStatus === 'rejected' && (
            <View style={styles.item}>
              <View style={styles.itemLeft}>
                <Shield size={20} color={colors.danger} />
                <Body>Solicitud rechazada</Body>
              </View>
            </View>
          )}
        </Card>

        <Card variant="elevated" size="lg" style={styles.listCard}>
          <H4 style={styles.sectionTitle}>Cuenta</H4>
          <Pressable style={styles.item} onPress={handleDeleteAccount}>
            <View style={styles.itemLeft}>
              <Trash2 size={20} color={colors.danger} />
              <Body style={styles.dangerText}>Eliminar cuenta</Body>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </Pressable>
        </Card>

        <Card variant="glass" size="md" style={styles.supportCard}>
          <Caption style={styles.supportTitle}>Soporte</Caption>
          <Caption style={styles.supportText}>{company.supportEmail}</Caption>
          <Caption style={styles.supportText}>{company.website}</Caption>
          <Caption style={styles.supportText}>{company.copyright}</Caption>
        </Card>

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
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  profileCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
    marginBottom: spacing.md,
  },
  textBlock: {
    alignItems: 'center',
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.textPrimary,
  },
  listCard: {
    padding: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  itemLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    flex: 1,
  },
  dangerText: {
    color: colors.danger,
  },
  supportCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  supportTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  supportText: {
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
});
