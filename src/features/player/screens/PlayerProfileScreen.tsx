import { useState } from 'react';
import { Alert, Pressable, StyleSheet, ScrollView, View } from 'react-native';
import { Calendar, ChevronRight, Edit2, Flag, LogOut, ShieldCheck, Star, Trophy, Trash2, User, Zap } from 'lucide-react-native';

import { useAuth } from '../../../core/providers/AuthProvider';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { H1, H3, H4, Body, Caption } from '../../../components/ui/Typography';
import { businessRules } from '../../../config/businessRules';
import { company } from '../../../config/company';
import { colors, spacing, borderRadius } from '../../../theme/designSystem';


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
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View>
        <Card variant="gradient" size="lg" style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User color={colors.background} size={32} />
            </View>
            <View style={styles.levelBadge}>
              <Badge label="LVL 1" variant="accent" size="sm" />
            </View>
          </View>
          <View style={styles.profileText}>
            <H1 style={styles.name}>{user?.fullName}</H1>
            <Body style={styles.muted}>Jugador · {businessRules.minimumAge}+</Body>
          </View>
          <View style={styles.xpBar}>
            <View style={styles.xpFill} />
          </View>
          <Caption style={styles.xpText}>0 / 100 XP</Caption>
        </Card>

        <View style={styles.statsRow}>
          <Card variant="glass" size="md" style={styles.statCard}>
            <Star size={24} color={colors.accent} />
            <H3 style={styles.statValue}>0.0</H3>
            <Caption>Rating</Caption>
          </Card>
          <Card variant="glass" size="md" style={styles.statCard}>
            <Trophy size={24} color={colors.primary} />
            <H3 style={styles.statValue}>0</H3>
            <Caption>Partidos</Caption>
          </Card>
          <Card variant="glass" size="md" style={styles.statCard}>
            <Zap size={24} color={colors.warning} />
            <H3 style={styles.statValue}>0</H3>
            <Caption>Streak</Caption>
          </Card>
        </View>

        <Card variant="elevated" size="lg" style={styles.listCard}>
          <H4 style={styles.sectionTitle}>Información personal</H4>
          <Pressable style={styles.item} onPress={() => setShowEditProfile(true)}>
            <View style={styles.itemLeft}>
              <Edit2 size={20} color={colors.textPrimary} />
              <Body>Editar perfil</Body>
            </View>
            <ChevronRight size={20} color={colors.textTertiary} />
          </Pressable>
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <Calendar size={20} color={colors.textPrimary} />
              <Body>Fecha de nacimiento</Body>
            </View>
            <Badge label="Pendiente" variant="default" size="sm" />
          </View>
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
          <Pressable style={styles.item} onPress={handleReportUser}>
            <View style={styles.itemLeft}>
              <Flag size={20} color={colors.textPrimary} />
              <Body>Reportar problema</Body>
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
      </View>
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
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
  profileText: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  name: {
    color: colors.textPrimary,
  },
  muted: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  xpBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  xpFill: {
    width: '0%',
    height: '100%',
    backgroundColor: colors.accent,
  },
  xpText: {
    color: colors.textTertiary,
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
