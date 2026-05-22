import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HelpCircle, Medal, Shield, Star, Target, Trophy, Users, Zap } from 'lucide-react-native';

import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { playerRanking } from '../../../data/mock';
import { colors, spacing, shadows } from '../../../theme/designSystem';
import type { PlayerRankingEntry } from '../../../types/domain';

const topPlayers = playerRanking.slice(0, 3);
const currentPlayer = playerRanking.find((player) => player.fullName === 'Ezequiel C.') ?? playerRanking[1];
const currentActiveClubs = 12;
const clubGoalForPrizes = 100;

const getSportsLabel = (sports: PlayerRankingEntry['sports']) => {
  if (sports.includes('football') && sports.includes('padel')) return 'Futbol + Padel';
  if (sports.includes('padel')) return 'Padel';
  return 'Futbol';
};

const getWinRate = (player: PlayerRankingEntry) => {
  if (player.matchesPlayed === 0) return 0;
  return Math.round((player.matchesWon / player.matchesPlayed) * 100);
};

const getRankTone = (index: number) => {
  if (index === 0) return styles.rankGold;
  if (index === 1) return styles.rankSilver;
  if (index === 2) return styles.rankBronze;
  return styles.rankDefault;
};

export function PlayerRankingScreen() {
  const handleOpenPrizeInfo = () => {
    Alert.alert(
      'Premios del ranking',
      `Cuando Fulbito llegue a ${clubGoalForPrizes} clubes activos, al cierre de cada mes se pagaran premios a los jugadores del top 3 por usar la app y mantener actividad real.\n\nClubes actuales: ${currentActiveClubs}/${clubGoalForPrizes}.\n\nEl ranking es global: suma futbol y padel en la misma tabla.\n\nSolo suman puntos los partidos con reserva real, pago registrado y confirmacion del club. Antes de pagar premios, Fulbito revisa actividad sospechosa.\n\nPara cobrar, carga tu alias de transferencia en el perfil de jugador.`,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Ranking</Text>
            <Pressable style={styles.helpButton} onPress={handleOpenPrizeInfo}>
              <HelpCircle size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>Tabla mensual global: futbol y padel suman en el mismo ranking.</Text>
        </View>

        <Card variant="elevated" size="lg" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIcon}>
              <Trophy size={24} color={colors.background} />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryTitle}>Tu posicion</Text>
              <Text style={styles.summarySubtitle}>Temporada actual</Text>
            </View>
            <Badge label="#2" variant="accent" size="sm" />
          </View>

          <View style={styles.currentPlayerRow}>
            <View>
              <Text style={styles.currentName}>{currentPlayer.fullName}</Text>
              <Text style={styles.currentMeta}>{getSportsLabel(currentPlayer.sports)} - {currentPlayer.neighborhood}</Text>
            </View>
            <View style={styles.pointsBox}>
              <Text style={styles.pointsValue}>{currentPlayer.points}</Text>
              <Text style={styles.pointsLabel}>PTS</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Target size={16} color={colors.primary} />
              <Text style={styles.metricValue}>{getWinRate(currentPlayer)}%</Text>
              <Text style={styles.metricLabel}>Victorias</Text>
            </View>
            <View style={styles.metricBox}>
              <Users size={16} color={colors.info} />
              <Text style={styles.metricValue}>{currentPlayer.matchesPlayed}</Text>
              <Text style={styles.metricLabel}>Partidos</Text>
            </View>
            <View style={styles.metricBox}>
              <Zap size={16} color={colors.warning} />
              <Text style={styles.metricValue}>{currentPlayer.streak}</Text>
              <Text style={styles.metricLabel}>Racha</Text>
            </View>
          </View>
        </Card>

        <View style={styles.topGrid}>
          {topPlayers.map((player, index) => (
            <Card key={player.id} variant="elevated" size="md" style={[styles.topCard, index === 0 && styles.topCardLeader]}>
              <View style={[styles.rankBadge, getRankTone(index)]}>
                <Text style={styles.rankBadgeText}>#{index + 1}</Text>
              </View>
              <Medal size={22} color={index === 0 ? '#D97706' : colors.textSecondary} />
              <Text style={styles.topName} numberOfLines={1}>{player.fullName}</Text>
              <Text style={styles.topPoints}>{player.points} pts</Text>
            </Card>
          ))}
        </View>

        <Card variant="elevated" size="lg" style={styles.listCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tabla general</Text>
            <View style={styles.sectionActions}>
              <Badge label={`${currentActiveClubs}/${clubGoalForPrizes} clubes`} variant="accent" size="sm" />
              <Badge label="Mensual" variant="default" size="sm" />
            </View>
          </View>

          {playerRanking.map((player, index) => (
            <View key={player.id} style={[styles.rankingRow, index === playerRanking.length - 1 && styles.rankingRowLast]}>
              <View style={[styles.positionBadge, getRankTone(index)]}>
                <Text style={styles.positionText}>{index + 1}</Text>
              </View>

              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.fullName}</Text>
                <Text style={styles.playerMeta}>{getSportsLabel(player.sports)} - {player.neighborhood}</Text>
              </View>

              <View style={styles.playerStats}>
                <Text style={styles.rowPoints}>{player.points}</Text>
                <Text style={styles.rowMeta}>{player.matchesWon}G - {player.mvps} MVP</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card variant="elevated" size="lg" style={styles.prizeCard}>
          <View style={styles.prizeHeader}>
            <View style={styles.prizeIcon}>
              <Trophy size={18} color={colors.primary} />
            </View>
            <View style={styles.prizeTextBlock}>
              <Text style={styles.sectionTitle}>Premios top 3</Text>
              <Text style={styles.prizeText}>
                Se activan cuando Fulbito llegue a {clubGoalForPrizes} clubes. Hoy van {currentActiveClubs}.
              </Text>
            </View>
            <Pressable style={styles.smallHelpButton} onPress={handleOpenPrizeInfo}>
              <Text style={styles.smallHelpText}>?</Text>
            </Pressable>
          </View>
        </Card>

        <Card variant="elevated" size="lg" style={styles.rulesCard}>
          <View style={styles.rulesHeader}>
            <Shield size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Como suma puntos</Text>
          </View>
          <View style={styles.ruleRow}>
            <Star size={16} color={colors.warning} />
            <Text style={styles.ruleText}>El ranking es global: los puntos de futbol y padel entran en la misma tabla.</Text>
          </View>
          <View style={styles.ruleRow}>
            <Star size={16} color={colors.warning} />
            <Text style={styles.ruleText}>Solo cuentan partidos con reserva real, pago registrado y asistencia validada por el club.</Text>
          </View>
          <View style={styles.ruleRow}>
            <Trophy size={16} color={colors.primary} />
            <Text style={styles.ruleText}>La victoria suma solo si el organizador declara resultado y los jugadores lo confirman.</Text>
          </View>
          <View style={styles.ruleRow}>
            <Shield size={16} color={colors.info} />
            <Text style={styles.ruleText}>Si hay disputa, el partido queda cerrado y suma asistencia, pero no victoria para nadie.</Text>
          </View>
          <View style={styles.ruleRow}>
            <Shield size={16} color={colors.info} />
            <Text style={styles.ruleText}>Antes de pagar premios se revisa que no haya reservas falsas, grupos repetidos ni actividad creada solo para subir puntos.</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    marginTop: spacing.sm,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  helpButton: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  summarySubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  currentPlayerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  currentMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },
  pointsBox: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    minWidth: 78,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pointsValue: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: '800',
  },
  pointsLabel: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricBox: {
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  topGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  topCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 128,
    padding: spacing.md,
    ...shadows.sm,
  },
  topCardLeader: {
    borderColor: '#FCD34D',
  },
  rankBadge: {
    alignItems: 'center',
    borderRadius: 8,
    minWidth: 42,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  rankBadgeText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  rankGold: {
    backgroundColor: '#FEF3C7',
  },
  rankSilver: {
    backgroundColor: '#E5E7EB',
  },
  rankBronze: {
    backgroundColor: '#FED7AA',
  },
  rankDefault: {
    backgroundColor: colors.cardLight,
  },
  topName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  topPoints: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  listCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  rankingRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 66,
    paddingVertical: spacing.sm,
  },
  rankingRowLast: {
    borderBottomWidth: 0,
  },
  positionBadge: {
    alignItems: 'center',
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  positionText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  playerMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  playerStats: {
    alignItems: 'flex-end',
  },
  rowPoints: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  rowMeta: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  prizeCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.sm,
  },
  prizeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  prizeIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  prizeTextBlock: {
    flex: 1,
  },
  prizeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 4,
  },
  smallHelpButton: {
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  smallHelpText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  rulesCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows.sm,
  },
  rulesHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ruleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ruleText: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
});
