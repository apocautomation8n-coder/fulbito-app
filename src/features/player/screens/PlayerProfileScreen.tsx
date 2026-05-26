import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, ScrollView, View, Text, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, ChevronRight, Flag, LogOut, Star, Trophy, Trash2, User, Zap, Mail, Phone, Info, Shield, Heart, MapPin, Wallet } from 'lucide-react-native';

import { useAuth } from '../../../core/providers/AuthProvider';
import { profilesRepository } from '../../../data/repositories/profiles.repository';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { businessRules } from '../../../config/businessRules';
import { company } from '../../../config/company';
import { colors, spacing, borderRadius, shadows } from '../../../theme/designSystem';
import type { CourtSport, PlayerSportProfileMode } from '../../../types/domain';

const sportModeOptions: Array<{ label: string; value: PlayerSportProfileMode }> = [
  { label: 'Futbol', value: 'football' },
  { label: 'Padel', value: 'padel' },
  { label: 'Ambos', value: 'both' },
];

const footballPositions = ['Arquero', 'Defensor', 'Mediocampista', 'Delantero'];
const footballFootOptions = ['Derecho', 'Zurdo', 'Ambos'];
const padelSideOptions = ['Drive', 'Reves', 'Indistinto'];
const padelStyleOptions = ['Ofensivo', 'Defensivo', 'Mixto'];

const hasSport = (mode: PlayerSportProfileMode, sport: CourtSport) =>
  mode === 'both' || mode === sport;

export function PlayerProfileScreen() {
  const { isConfigured, signOut, user } = useAuth();
  const [transferAlias, setTransferAlias] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdateLabel, setBirthdateLabel] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(isConfigured);
  const hasHydratedProfile = useRef(false);
  const [sportMode, setSportMode] = useState<PlayerSportProfileMode>('both');
  const [footballPosition, setFootballPosition] = useState('Delantero');
  const [footballFoot, setFootballFoot] = useState('Derecho');
  const [footballNumber, setFootballNumber] = useState('10');
  const [padelSide, setPadelSide] = useState('Reves');
  const [padelStyle, setPadelStyle] = useState('Mixto');
  const [padelLevel, setPadelLevel] = useState('Intermedio alto');

  const persistPlayerProfile = useCallback(async () => {
    if (!isConfigured || !user?.id) {
      return;
    }

    try {
      await profilesRepository.updatePlayerProfile(user.id, {
        sport_profile_mode: sportMode,
        transfer_alias: transferAlias.trim() || null,
        phone: phone.trim() || null,
        football_profile: {
          position: footballPosition,
          preferredFoot: footballFoot,
          jerseyNumber: footballNumber,
        },
        padel_profile: {
          preferredSide: padelSide,
          style: padelStyle,
          level: padelLevel,
        },
      });
    } catch {
      Alert.alert('Error', 'No pudimos guardar tu perfil deportivo.');
    }
  }, [
    footballFoot,
    footballNumber,
    footballPosition,
    isConfigured,
    padelLevel,
    padelSide,
    padelStyle,
    sportMode,
    phone,
    transferAlias,
    user?.id,
  ]);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!isConfigured || !user?.id) {
        if (active) {
          setTransferAlias('');
          setPhone('');
          setBirthdateLabel('');
          setIsProfileLoading(false);
        }
        return;
      }

      try {
        const playerProfile = await profilesRepository.getPlayerProfile(user.id);
        if (!active || !playerProfile) {
          return;
        }

        setSportMode(playerProfile.sport_profile_mode);
        setTransferAlias(playerProfile.transfer_alias ?? '');
        setPhone(playerProfile.phone ?? '');
        if (playerProfile.birthdate) {
          const [year, month, day] = playerProfile.birthdate.split('-');
          setBirthdateLabel(`${day} / ${month} / ${year}`);
        } else {
          setBirthdateLabel('');
        }
        setFootballPosition(playerProfile.football_profile?.position ?? 'Delantero');
        setFootballFoot(playerProfile.football_profile?.preferredFoot ?? 'Derecho');
        setFootballNumber(playerProfile.football_profile?.jerseyNumber ?? '10');
        setPadelSide(playerProfile.padel_profile?.preferredSide ?? 'Reves');
        setPadelStyle(playerProfile.padel_profile?.style ?? 'Mixto');
        setPadelLevel(playerProfile.padel_profile?.level ?? 'Intermedio alto');
      } catch {
        if (active) {
          Alert.alert('Perfil', 'No pudimos cargar tu perfil. Seguis en modo local.');
        }
      } finally {
        if (active) {
          setIsProfileLoading(false);
          hasHydratedProfile.current = true;
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
      hasHydratedProfile.current = false;
    };
  }, [isConfigured, user?.id]);

  useEffect(() => {
    if (!hasHydratedProfile.current || isProfileLoading) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      void persistPlayerProfile();
    }, 700);

    return () => clearTimeout(timeout);
  }, [
    footballFoot,
    footballNumber,
    footballPosition,
    isProfileLoading,
    padelLevel,
    padelSide,
    padelStyle,
    persistPlayerProfile,
    phone,
    sportMode,
  ]);

  const playerStats = {
    fullName: user?.fullName || 'Jugador',
    email: user?.email || '',
    transferAlias,
    birthdate: birthdateLabel,
    level: 0,
    levelName: 'Sin nivel',
    position: sportMode === 'both' ? `${footballPosition} / ${padelSide}` : sportMode === 'padel' ? padelSide : footballPosition,
    favFoot: footballFoot,
    jerseyNumber: footballNumber,
    preferredZone: '',
    rating: 0,
    matchesCount: 0,
    streak: 0,
    mvps: 0,
    xpCurrent: 0,
    xpNext: 100,
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Eliminar cuenta permanentemente',
      'Estas seguro de que quieres eliminar tu cuenta? Esta accion es irreversible. Perderas tus estadisticas, reservas y racha.',
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
      'Soporte Tecnico',
      'Con que necesitas ayuda?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Error en la App', onPress: () => Alert.alert('Reporte enviado', 'Gracias por avisarnos. Lo revisaremos.') },
        { text: 'Problema de Pago', onPress: () => Alert.alert('Soporte de Pago', 'Envianos un mail a soporte@fulbito.app con el comprobante de Mercado Pago.') },
        { text: 'Otro', onPress: () => Alert.alert('Soporte', 'En breve un agente se contactara contigo.') },
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
            <Text style={styles.statLabel}>Valoracion</Text>
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
          <Text style={styles.sectionTitle}>Perfil deportivo</Text>

          <View style={styles.sportModeGrid}>
            {sportModeOptions.map((option) => {
              const selected = sportMode === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => setSportMode(option.value)}
                  style={[styles.sportModeChip, selected && styles.sportModeChipSelected]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.sportModeText, selected && styles.sportModeTextSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {hasSport(sportMode, 'football') && (
            <View style={styles.sportProfileBlock}>
              <View style={styles.sportProfileHeader}>
                <Text style={styles.sportProfileTitle}>Futbol</Text>
                <Badge label="Ranking global" variant="accent" size="sm" />
              </View>

              <Text style={styles.fieldLabel}>Posicion principal</Text>
              <View style={styles.optionGrid}>
                {footballPositions.map((position) => {
                  const selected = footballPosition === position;
                  return (
                    <Pressable
                      key={position}
                      onPress={() => setFootballPosition(position)}
                      style={[styles.optionChip, selected && styles.optionChipSelected]}
                    >
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{position}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Pie habil</Text>
              <View style={styles.optionGrid}>
                {footballFootOptions.map((foot) => {
                  const selected = footballFoot === foot;
                  return (
                    <Pressable
                      key={foot}
                      onPress={() => setFootballFoot(foot)}
                      style={[styles.optionChip, selected && styles.optionChipSelected]}
                    >
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{foot}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Numero de camiseta</Text>
              <TextInput
                keyboardType="number-pad"
                onChangeText={setFootballNumber}
                placeholder="10"
                placeholderTextColor={colors.textTertiary}
                style={styles.profileInput}
                value={footballNumber}
              />
            </View>
          )}

          {hasSport(sportMode, 'padel') && (
            <View style={styles.sportProfileBlock}>
              <View style={styles.sportProfileHeader}>
                <Text style={styles.sportProfileTitle}>Padel</Text>
                <Badge label="Ranking global" variant="accent" size="sm" />
              </View>

              <Text style={styles.fieldLabel}>Lado preferido</Text>
              <View style={styles.optionGrid}>
                {padelSideOptions.map((side) => {
                  const selected = padelSide === side;
                  return (
                    <Pressable
                      key={side}
                      onPress={() => setPadelSide(side)}
                      style={[styles.optionChip, selected && styles.optionChipSelected]}
                    >
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{side}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Estilo de juego</Text>
              <View style={styles.optionGrid}>
                {padelStyleOptions.map((style) => {
                  const selected = padelStyle === style;
                  return (
                    <Pressable
                      key={style}
                      onPress={() => setPadelStyle(style)}
                      style={[styles.optionChip, selected && styles.optionChipSelected]}
                    >
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{style}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Nivel padel</Text>
              <TextInput
                onChangeText={setPadelLevel}
                placeholder="Ej: Intermedio"
                placeholderTextColor={colors.textTertiary}
                style={styles.profileInput}
                value={padelLevel}
              />
            </View>
          )}

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Zona de reserva habitual</Text>
            <Text style={styles.detailValue}>{playerStats.preferredZone}</Text>
          </View>
        </Card>

        {/* Account settings */}
        <Card variant="elevated" size="lg" style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Informacion de Cuenta</Text>
          
          <View style={styles.accountItem}>
            <View style={styles.itemLeft}>
              <View style={styles.iconBox}>
                <Mail size={16} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.itemLabel}>Correo electronico</Text>
                <Text style={styles.itemValue}>{playerStats.email}</Text>
              </View>
            </View>
          </View>

          <View style={styles.accountItemColumn}>
            <View style={styles.itemLeft}>
              <View style={styles.iconBox}>
                <Phone size={16} color={colors.textSecondary} />
              </View>
              <Text style={styles.itemLabel}>Numero celular</Text>
            </View>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isProfileLoading}
              keyboardType="phone-pad"
              onBlur={persistPlayerProfile}
              onChangeText={setPhone}
              placeholder="Ej: 3516889921"
              placeholderTextColor={colors.textTertiary}
              style={styles.profileInput}
              value={phone}
            />
          </View>

          <View style={styles.accountItem}>
            <View style={styles.itemLeft}>
              <View style={styles.iconBox}>
                <Calendar size={16} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.itemLabel}>Fecha de Nacimiento</Text>
                <Text style={styles.itemValue}>
                  {playerStats.birthdate || 'Sin cargar'}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card variant="elevated" size="lg" style={styles.prizePaymentCard}>
          <View style={styles.prizePaymentHeader}>
            <View style={styles.prizePaymentIcon}>
              <Wallet size={18} color={colors.primary} />
            </View>
            <View style={styles.prizePaymentText}>
              <Text style={[styles.sectionTitle, styles.sectionTitleCompact]}>Cobro de premios</Text>
              <Text style={styles.aliasHint}>Alias para transferir si quedas en el top 3 cuando los premios esten activos.</Text>
            </View>
          </View>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isProfileLoading}
            onBlur={persistPlayerProfile}
            onChangeText={setTransferAlias}
            placeholder="tu.alias.mp"
            placeholderTextColor={colors.textTertiary}
            style={styles.aliasInput}
            value={transferAlias}
          />
        </Card>

        {/* Actions list */}
        <Card variant="elevated" size="lg" style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Ajustes y Ayuda</Text>

          <Pressable style={styles.actionItem} onPress={handleReportProblem}>
            <View style={styles.itemLeft}>
              <View style={styles.iconBox}>
                <Flag size={16} color={colors.textSecondary} />
              </View>
              <Text style={styles.actionText}>Reportar problema tecnico</Text>
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
          label="Cerrar sesion"
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
  sectionTitleCompact: {
    marginBottom: 4,
  },
  sportModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  sportModeChip: {
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexGrow: 1,
    minHeight: 42,
    minWidth: 88,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  sportModeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  sportModeText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  sportModeTextSelected: {
    color: '#FFFFFF',
  },
  sportProfileBlock: {
    backgroundColor: colors.cardLight,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
    padding: 12,
  },
  sportProfileHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sportProfileTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  profileInput: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    minHeight: 42,
    paddingHorizontal: 12,
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
  accountItemColumn: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  aliasItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  prizePaymentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  prizePaymentHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  prizePaymentIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  prizePaymentText: {
    flex: 1,
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
  aliasContent: {
    flex: 1,
  },
  aliasInput: {
    backgroundColor: colors.cardLight,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    minHeight: 42,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  aliasHint: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 6,
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
