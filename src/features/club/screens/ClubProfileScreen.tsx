import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Building2, ChevronRight, CreditCard, Edit2, Home, LogOut, MapPin, Send, Settings, Shield, Trash2 } from 'lucide-react-native';

import { useAuth } from '../../../core/providers/AuthProvider';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { clubsService } from '../../../data/services/clubs.service';
import { businessRules } from '../../../config/businessRules';
import { company } from '../../../config/company';
import { colors, spacing, typography } from '../../../theme/theme';

export function ClubProfileScreen() {
  const { signOut, user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'draft' | 'pending' | 'approved' | 'rejected'>('draft');

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
              // TODO: Get actual club ID from auth context
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

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'approved':
        return colors.success;
      case 'pending':
        return colors.coral;
      case 'rejected':
        return colors.danger;
      default:
        return colors.muted;
    }
  };

  const getStatusText = () => {
    switch (verificationStatus) {
      case 'approved':
        return 'Verificado';
      case 'pending':
        return 'Pendiente de aprobación';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'Borrador';
    }
  };

  return (
    <Screen title="Club" subtitle={user?.email}>
      <Card style={styles.profile}>
        <View style={styles.iconWrap}>
          <Building2 color={colors.primary} size={28} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{user?.fullName}</Text>
          <Text style={[styles.subtitle, { color: getStatusColor() }]}>Estado: {getStatusText()}</Text>
        </View>
      </Card>

      <Card style={styles.list}>
        <Text style={styles.sectionTitle}>Información del club</Text>
        <Pressable style={styles.item}>
          <View style={styles.itemLeft}>
            <Edit2 color={colors.ink} size={18} />
            <Text style={styles.itemText}>Editar perfil</Text>
          </View>
          <ChevronRight color={colors.muted} size={16} />
        </Pressable>
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <MapPin color={colors.ink} size={18} />
            <Text style={styles.itemText}>Dirección</Text>
          </View>
          <Text style={styles.itemValue}>Pendiente</Text>
        </View>
      </Card>

      <Card style={styles.list}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Settings color={colors.ink} size={18} />
            <Text style={styles.itemText}>Deadline split</Text>
          </View>
          <Text style={styles.itemValue}>{businessRules.defaultSplitDeadlineHoursBeforeKickoff}h</Text>
        </View>
        <Pressable style={styles.item} onPress={handleConnectMercadoPago}>
          <View style={styles.itemLeft}>
            <CreditCard color={colors.ink} size={18} />
            <Text style={styles.itemText}>MercadoPago</Text>
          </View>
          <Text style={[styles.itemValue, styles.pendingValue]}>No conectado</Text>
        </Pressable>
      </Card>

      <Card style={styles.list}>
        <Text style={styles.sectionTitle}>Verificación</Text>
        {verificationStatus === 'draft' && (
          <Button
            icon={<Send color={colors.surface} size={18} />}
            label="Solicitar aprobación"
            onPress={handleSubmitForApproval}
          />
        )}
        {verificationStatus === 'pending' && (
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <Shield color={colors.coral} size={18} />
              <Text style={styles.itemText}>Solicitud en revisión</Text>
            </View>
          </View>
        )}
        {verificationStatus === 'approved' && (
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <Shield color={colors.success} size={18} />
              <Text style={styles.itemText}>Club verificado</Text>
            </View>
          </View>
        )}
        {verificationStatus === 'rejected' && (
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <Shield color={colors.danger} size={18} />
              <Text style={styles.itemText}>Solicitud rechazada</Text>
            </View>
          </View>
        )}
      </Card>

      <Card style={styles.list}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <Pressable style={styles.item} onPress={handleDeleteAccount}>
          <View style={styles.itemLeft}>
            <Trash2 color={colors.danger} size={18} />
            <Text style={[styles.itemText, styles.dangerText]}>Eliminar cuenta</Text>
          </View>
          <ChevronRight color={colors.muted} size={16} />
        </Pressable>
      </Card>

      <Card style={styles.list}>
        <Text style={styles.supportTitle}>Soporte</Text>
        <Text style={styles.supportText}>{company.supportEmail}</Text>
        <Text style={styles.supportText}>{company.website}</Text>
        <Text style={styles.supportText}>{company.copyright}</Text>
      </Card>

      <Button
        icon={<LogOut color={colors.ink} size={18} />}
        label="Salir"
        onPress={signOut}
        variant="secondary"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.small,
    marginTop: spacing.xs,
  },
  list: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  itemLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    flex: 1,
  },
  itemText: {
    color: colors.ink,
    fontSize: typography.body,
  },
  itemValue: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '600',
  },
  pendingValue: {
    color: colors.coral,
  },
  dangerText: {
    color: colors.danger,
  },
  card: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  supportTitle: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '800',
  },
  supportText: {
    color: colors.muted,
    fontSize: typography.small,
  },
});
