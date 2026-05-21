import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, ChevronRight, Edit2, Flag, LogOut, ShieldCheck, Star, Trash2, User, UserX } from 'lucide-react-native';

import { useAuth } from '../../../core/providers/AuthProvider';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { businessRules } from '../../../config/businessRules';
import { company } from '../../../config/company';
import { colors, spacing, typography } from '../../../theme/theme';

export function PlayerProfileScreen() {
  const { signOut, user } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y se eliminarán todos tus datos.',
      [
        { text: 'Cancelar' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement actual account deletion using profiles service
              // await profilesService.deleteAccount(user?.id);
              Alert.alert(
                'Cuenta eliminada',
                'Tu cuenta ha sido eliminada exitosamente.',
                [
                  {
                    text: 'OK',
                    onPress: () => signOut(),
                  },
                ],
              );
            } catch (error) {
              Alert.alert('Error', 'No pudimos eliminar tu cuenta. Por favor intenta nuevamente.');
            }
          },
        },
      ],
    );
  };

  const handleReportUser = () => {
    Alert.alert(
      'Reportar problema',
      '¿Qué tipo de problema quieres reportar?',
      [
        { text: 'Cancelar' },
        { text: 'Contenido inapropiado', onPress: () => submitReport('inappropriate_content') },
        { text: 'Comportamiento abusivo', onPress: () => submitReport('abusive_behavior') },
        { text: 'Spam', onPress: () => submitReport('spam') },
        { text: 'Otro', onPress: () => submitReport('other') },
      ],
    );
  };

  const submitReport = async (reason: string) => {
    Alert.alert(
      'Confirmar reporte',
      '¿Estás seguro de que quieres enviar este reporte?',
      [
        { text: 'Cancelar' },
        {
          text: 'Enviar',
          onPress: async () => {
            try {
              // TODO: Implement actual report submission using profiles service
              // await profilesService.submitReport({ reason, targetUserId: user?.id });
              Alert.alert('Reporte enviado', 'Tu reporte ha sido enviado y será revisado.');
            } catch (error) {
              Alert.alert('Error', 'No pudimos enviar tu reporte. Por favor intenta nuevamente.');
            }
          },
        },
      ],
    );
  };

  if (showEditProfile) {
    // TODO: Create EditPlayerProfileScreen
    return null;
  }

  return (
    <Screen title="Perfil" subtitle={user?.email}>
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <User color={colors.primary} size={28} />
        </View>
        <View style={styles.profileText}>
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.muted}>Jugador · {businessRules.minimumAge}+</Text>
        </View>
      </Card>

      <Card style={styles.list}>
        <Text style={styles.sectionTitle}>Información personal</Text>
        <Pressable style={styles.item} onPress={() => setShowEditProfile(true)}>
          <View style={styles.itemLeft}>
            <Edit2 color={colors.ink} size={18} />
            <Text style={styles.itemText}>Editar perfil</Text>
          </View>
          <ChevronRight color={colors.muted} size={16} />
        </Pressable>
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Calendar color={colors.ink} size={18} />
            <Text style={styles.itemText}>Fecha de nacimiento</Text>
          </View>
          <Text style={styles.itemValue}>Pendiente</Text>
        </View>
      </Card>

      <Card style={styles.list}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Star color={colors.accent} size={18} />
            <Text style={styles.itemText}>Rating promedio</Text>
          </View>
          <Text style={styles.itemValue}>0.0</Text>
        </View>
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <ShieldCheck color={colors.success} size={18} />
            <Text style={styles.itemText}>Partidos jugados</Text>
          </View>
          <Text style={styles.itemValue}>0</Text>
        </View>
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
        <Pressable style={styles.item} onPress={handleReportUser}>
          <View style={styles.itemLeft}>
            <Flag color={colors.coral} size={18} />
            <Text style={styles.itemText}>Reportar problema</Text>
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
  profileCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  profileText: {
    flex: 1,
  },
  name: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  muted: {
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
  dangerText: {
    color: colors.danger,
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
