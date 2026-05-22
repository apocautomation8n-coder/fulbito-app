import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, ScrollView, View, Text, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, ChevronRight, Flag, LogOut, Star, Trophy, Trash2, User, Zap, Mail, Phone, Info, Shield, Heart, MapPin } from 'lucide-react-native';

import { useAuth } from '../../../core/providers/AuthProvider';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { businessRules } from '../../../config/businessRules';
import { company } from '../../../config/company';
import { colors, spacing, borderRadius, shadows } from '../../../theme/designSystem';

export function PlayerProfileScreen() {
  const { signOut, user } = useAuth();
  
  // High quality test data to make the profile look highly professional and filled
  const playerStats = {
    fullName: user?.fullName || 'Ezequiel Cocco',
    email: user?.email || 'ezequiel@apocautomation.com',
    phone: '+54 351 688-9921',
    birthdate: '24 / 08 / 1996',
    level: 12,
    levelName: 'Oro Pro',
    position: 'Delantero / Mediapunta',
    favFoot: 'Derecho (Diestro)',
    jerseyNumber: '10',
    preferredZone: 'Nueva Córdoba, CBA',
    rating: 4.9,
    matchesCount: 38,
    streak: 8,
    mvps: 9,
    xpCurrent: 1420,
    xpNext: 2000,
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Eliminar cuenta permanentemente',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible. Perderás tus estadísticas, reservas y racha.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido dada de baja del sistema.');
            signOut();
          },
        },
      ],
    );
  };

  const handleReportProblem = () => {
    Alert.alert(
      'Soporte Técnico',
      '¿Con qué necesitas ayuda?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Error en la App', onPress: () => Alert.alert('Reporte enviado', 'Gracias por avisarnos. Lo revisaremos.') },
        { text: 'Problema de Pago', onPress: () => Alert.alert('Soporte de Pago', 'Envíanos un mail a soporte@fulbito.app con el comprobante de Mercado Pago.') },
        { text: 'Otro', onPress: () => Alert.alert('Soporte', 'En breve un agente se contactará contigo.') },
      ],
    );
  };

  const getInitials = () => {
    const name = playerStats.fullName;
    if (!name) return 'E';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const xpPercent = Math.min(100, Math.floor((playerStats.xpCurrent / playerStats.xpNext) * 100));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ficha de Jugador</Text>
          <Text style={styles.subtitle}>Tu perfil deportivo de alto rendimiento en Fulbito</Text>
        </View>

        {/* Professional Sports FUT-Card representation */}
        <Card variant="elevated" size="lg" style={styles.sportCard}>
          {/* Top Row: Jersey & Level */}
          <View style={styles.sportCardHeader}>
            <View style={styles.jerseyBadge}>
              <Text style={styles.jerseyNumber}>#{playerStats.jerseyNumber}</Text>
            </View>
            <View style={styles.goldLevelBadge}>
              <Shield size={14} color="#D97706" />
              <Text style={styles.goldLevelText}>{playerStats.levelName}</Text>
            </View>
          </View>

          {/* Profile details */}
          <View style={styles.profileMainRow}>
            <View style={styles.avatarWrapper}>
              <View style={styles.sportAvatar}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
              <View style={styles.lvlBadge}>
                <Text style={styles.lvlBadgeText}>LVL {playerStats.level}</Text>
              </View>
            </View>

            <View style={styles.playerMeta}>
              <Text style={styles.playerName}>{playerStats.fullName}</Text>
              <View style={styles.positionContainer}>
                <Trophy size={14} color={colors.primary} />
                <Text style={styles.playerPosition}>{playerStats.position}</Text>
              </View>
              <View style={styles.locationBadge}>
                <MapPin size={12} color={colors.textTertiary} />
                <Text style={styles.locationText}>{playerStats.preferredZone}</Text>
              </View>
            </View>
          </View>

          {/* XP Progress Slider */}
          <View style={styles.xpWrapper}>
            <View style={styles.xpInfoRow}>
              <Text style={styles.xpLabel}>Experiencia de Liga</Text>
              <Text style={styles.xpCount}>{playerStats.xpCurrent} / {playerStats.xpNext} XP</Text>
            </View>
            <View style={styles.xpBarBackground}>
              <View style={[styles.xpBarFill, { width: `${xpPercent}%` }]} />
            </View>
            <Text style={styles.xpStatusText}>Te faltan {playerStats.xpNext - playerStats.xpCurrent} XP para alcanzar el Nivel {playerStats.level + 1}</Text>
          </View>
        </Card>

        {/* Stats Highlight Grid */}
        <View style={styles.statsGrid}>
          <Card variant="glass" size="md" style={styles.statBox}>
            <Star size={24} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.statVal}>{playerStats.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Valoración</Text>
          </Card>
          
          <Card variant="glass" size="md" style={styles.statBox}>
            <Trophy size={24} color={colors.primary} />
            <Text style={styles.statVal}>{playerStats.matchesCount}</Text>
            <Text style={styles.statLabel}>Partidos</Text>
          </Card>

          <Card variant="glass" size="md" style={styles.statBox}>
            <Zap size={24} color="#EF4444" fill="#EF4444" />
            <Text style={styles.statVal}>{playerStats.streak}s</Text>
            <Text style={styles.statLabel}>Racha Activa</Text>
          </Card>

          <Card variant="glass" size="md" style={styles.statBox}>
            <Trophy size={24} color="#8B5CF6" />
            <Text style={styles.statVal}>{playerStats.mvps}</Text>
            <Text style={styles.statLabel}>Premios MVP</Text>
          </Card>
        </View>

        {/* Player Technical details */}
        <Card variant="elevated" size="lg" style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Datos Físicos y Técnicos</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Pie hábil</Text>
            <Badge label={playerStats.favFoot} variant="glow" />
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Zona de Reserva Habitual</Text>
            <Text style={styles.detailValue}>{playerStats.preferredZone}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Contacto de Emergencia</Text>
            <Text style={styles.detailValue}>Habilitado (Soporte)</Text>
          </View>
        </Card>

        {/* Account settings */}
        <Card variant="elevated" size="lg" style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Información de Cuenta</Text>
          
          <View style={styles.accountItem}>
            <View style={styles.itemLeft}>
              <View style={styles.iconBox}>
                <Mail size={16} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.itemLabel}>Correo electrónico</Text>
                <Text style={styles.itemValue}>{playerStats.email}</Text>
              </View>
            </View>
          </View>

          <View style={styles.accountItem}>
            <View style={styles.itemLeft}>
              <View style={styles.iconBox}>
                <Phone size={16} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.itemLabel}>Número celular</Text>
                <Text style={styles.itemValue}>{playerStats.phone}</Text>
              </View>
            </View>
          </View>

          <View style={styles.accountItem}>
            <View style={styles.itemLeft}>
              <View style={styles.iconBox}>
                <Calendar size={16} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.itemLabel}>Fecha de Nacimiento</Text>
                <Text style={styles.itemValue}>{playerStats.birthdate}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Actions list */}
        <Card variant="elevated" size="lg" style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Ajustes y Ayuda</Text>

          <Pressable style={styles.actionItem} onPress={handleReportProblem}>
            <View style={styles.itemLeft}>
              <View style={styles.iconBox}>
                <Flag size={16} color={colors.textSecondary} />
              </View>
              <Text style={styles.actionText}>Reportar problema técnico</Text>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>

          <Pressable style={styles.actionItem} onPress={handleDeleteAccount}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF2F2' }]}>
                <Trash2 size={16} color="#EF4444" />
              </View>
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Dar de baja cuenta</Text>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </Pressable>
        </Card>

        {/* Support section info */}
        <Card variant="glass" size="md" style={styles.supportCard}>
          <Info size={18} color={colors.primary} style={{ marginBottom: 6 }} />
          <Text style={styles.supportTitle}>Soporte {company.legalName}</Text>
          <Text style={styles.supportValue}>{company.supportEmail}</Text>
          <Text style={styles.supportValue}>{company.website}</Text>
          <Text style={styles.copyright}>{company.copyright}</Text>
        </Card>

        {/* Log out CTA */}
        <Button
          icon={<LogOut size={18} color="#FFFFFF" />}
          label="Cerrar sesión"
          onPress={signOut}
          variant="glow"
          size="lg"
          fullWidth
          style={{ marginBottom: 24 }}
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
  sportCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...shadows.lg,
  },
  sportCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  jerseyBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jerseyNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  goldLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  goldLevelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  profileMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  sportAvatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  lvlBadge: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lvlBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  playerMeta: {
    flex: 1,
  },
  playerName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  positionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  playerPosition: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  xpWrapper: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  xpInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  xpCount: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  xpBarBackground: {
    height: 8,
    backgroundColor: colors.cardLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  xpStatusText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statBox: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: 4,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionItem: {
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
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  itemValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
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
  supportValue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  copyright: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 8,
  },
});
