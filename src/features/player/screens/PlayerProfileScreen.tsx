import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, ChevronRight, Edit2, Flag, LogOut, ShieldCheck, Star, Trophy, Trash2, User, Zap, Mail, Phone, Info } from 'lucide-react-native';

import { useAuth } from '../../../core/providers/AuthProvider';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { businessRules } from '../../../config/businessRules';
import { company } from '../../../config/company';
import { colors, spacing, borderRadius, shadows } from '../../../theme/designSystem';

export function PlayerProfileScreen() {
  const { signOut, user } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Realistic mock data for a filled player profile
  const mockPlayerStats = {
    rating: 4.8,
    matchesPlayed: 14,
    streak: 5,
    level: 4,
    xpCurrent: 380,
    xpNext: 500,
    birthdate: '14/10/1998',
    phone: '+54 351 599-2811',
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y se perderán todos tus partidos e historial de reservas.',
      [
        { text: 'Cancelar', style: 'cancel' },
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
      'Reportar un problema',
      'Selecciona el motivo de tu reporte:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Fallo en la aplicación', onPress: () => submitReport('app_bug') },
        { text: 'Inconveniente con un club', onPress: () => submitReport('club_issue') },
        { text: 'Problema con un pago', onPress: () => submitReport('payment_issue') },
        { text: 'Otro', onPress: () => submitReport('other') },
      ],
    );
  };

  const submitReport = (reason: string) => {
    Alert.alert('Reporte enviado', 'Tu reporte ha sido enviado y nuestro equipo de soporte lo revisará en las próximas 24 horas.');
  };

  // Get first letter of full name for modern avatar icon fallback
  const getInitials = () => {
    if (!user?.fullName) return 'J';
    return user.fullName.charAt(0).toUpperCase();
  };

  const xpPercent = Math.min(100, Math.floor((mockPlayerStats.xpCurrent / mockPlayerStats.xpNext) * 100));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
          <Text style={styles.subtitle}>Administra tus datos, nivel de jugador y estadísticas de juego.</Text>
        </View>

        {/* Profile Card */}
        <Card variant="elevated" size="lg" style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
              <View style={styles.levelBadge}>
                <Badge label={`NIVEL ${mockPlayerStats.level}`} variant="accent" size="sm" />
              </View>
            </View>

            <View style={styles.profileMeta}>
              <Text style={styles.profileName}>{user?.fullName || 'Fútbolista Demo'}</Text>
              <Text style={styles.profileRole}>Jugador Verificado</Text>
            </View>
          </View>

          {/* XP Progress Section */}
          <View style={styles.xpSection}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpTitle}>Progreso de Nivel</Text>
              <Text style={styles.xpValue}>{mockPlayerStats.xpCurrent} / {mockPlayerStats.xpNext} XP</Text>
            </View>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${xpPercent}%` }]} />
            </View>
            <Text style={styles.xpHint}>Faltan {mockPlayerStats.xpNext - mockPlayerStats.xpCurrent} XP para subir al Nivel {mockPlayerStats.level + 1}</Text>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <Card variant="glass" size="md" style={styles.statCard}>
            <Star size={22} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.statValue}>{mockPlayerStats.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </Card>
          <Card variant="glass" size="md" style={styles.statCard}>
            <Trophy size={22} color={colors.primary} />
            <Text style={styles.statValue}>{mockPlayerStats.matchesPlayed}</Text>
            <Text style={styles.statLabel}>Partidos</Text>
          </Card>
          <Card variant="glass" size="md" style={styles.statCard}>
            <Zap size={22} color="#EF4444" fill="#EF4444" />
            <Text style={styles.statValue}>{mockPlayerStats.streak}</Text>
            <Text style={styles.statLabel}>Racha</Text>
          </Card>
        </View>

        {/* Personal Details List */}
        <Card variant="elevated" size="lg" style={styles.listCard}>
          <Text style={styles.sectionTitle}>Información del Jugador</Text>
          
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <View style={styles.iconContainer}>
                <Mail size={16} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.itemLabel}>Correo electrónico</Text>
                <Text style={styles.itemValue}>{user?.email || 'demo@fulbito.app'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <View style={styles.iconContainer}>
                <Phone size={16} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.itemLabel}>Teléfono móvil</Text>
                <Text style={styles.itemValue}>{mockPlayerStats.phone}</Text>
              </View>
            </View>
          </View>

          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <View style={styles.iconContainer}>
                <Calendar size={16} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.itemLabel}>Fecha de nacimiento</Text>
                <Text style={styles.itemValue}>{mockPlayerStats.birthdate}</Text>
              </View>
            </View>
            <Badge label="Verificado" variant="glow" size="sm" />
          </View>
        </Card>

        {/* Account settings and options */}
        <Card variant="elevated" size="lg" style={styles.listCard}>
          <Text style={styles.sectionTitle}>Ajustes y Privacidad</Text>

          <Pressable style={styles.clickableItem} onPress={handleReportUser}>
            <View style={styles.itemLeft}>
              <View style={styles.iconContainer}>
                <Flag size={16} color={colors.textSecondary} />
              </View>
              <Text style={styles.clickableText}>Reportar un problema</Text>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>

          <Pressable style={styles.clickableItem} onPress={handleDeleteAccount}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconContainer, styles.dangerIconContainer]}>
                <Trash2 size={16} color="#EF4444" />
              </View>
              <Text style={[styles.clickableText, styles.dangerText]}>Eliminar cuenta</Text>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
        </Card>

        {/* Support Information Footer */}
        <Card variant="glass" size="md" style={styles.supportCard}>
          <Info size={20} color={colors.primary} style={{ marginBottom: 6 }} />
          <Text style={styles.supportTitle}>Soporte Oficial Fulbito</Text>
          <Text style={styles.supportText}>{company.supportEmail}</Text>
          <Text style={styles.supportText}>{company.website}</Text>
          <Text style={styles.copyrightText}>{company.copyright}</Text>
        </Card>

        {/* Log Out CTA */}
        <Button
          icon={<LogOut size={18} color="#FFFFFF" />}
          label="Cerrar Sesión"
          onPress={signOut}
          variant="glow"
          size="lg"
          fullWidth
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: 16,
  },
  header: {
    marginBottom: 20,
    marginTop: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  profileRole: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  xpSection: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  xpTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  xpValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  xpBar: {
    height: 8,
    backgroundColor: colors.cardLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  xpHint: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  listCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  clickableItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerIconContainer: {
    backgroundColor: '#FEF2F2',
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  clickableText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dangerText: {
    color: '#EF4444',
  },
  supportCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  supportTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  supportText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  copyrightText: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 16,
  },
});
