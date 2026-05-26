import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { HelpCircle, Medal, Shield, Star, Target, Trophy, Users, Zap } from 'lucide-react-native';

import { useAuth } from '../../../core/providers/AuthProvider';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { clubsRepository } from '../../../data/repositories/clubs.repository';
import { colors, spacing, shadows } from '../../../theme/designSystem';
import type { PlayerRankingEntry } from '../../../types/domain';

const clubGoalForPrizes = 100;

export function PlayerRankingScreen() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<PlayerRankingEntry[]>([]);
  const [activeClubs, setActiveClubs] = useState(0);

  const loadRanking = useCallback(async () => {
    try {
      const clubs = await clubsRepository.getApprovedClubs();
      setActiveClubs(clubs.length);
    } catch {
      setActiveClubs(0);
    }
    setRanking([]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadRanking();
    }, [loadRanking]),
  );

  const handleOpenPrizeInfo = () => {
    Alert.alert(
      'Premios del ranking',
      `Cuando Fulbito llegue a ${clubGoalForPrizes} clubes activos, al cierre de cada mes se pagaran premios a los jugadores del top 3.\n\nClubes actuales: ${activeClubs}/${clubGoalForPrizes}.\n\nEl ranking es global: suma futbol y padel en la misma tabla.\n\nSolo suman puntos los partidos con reserva real, pago registrado y confirmacion del club.`,
    );
  };

  const topPlayers = ranking.slice(0, 3);

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
              <Text style={styles.summarySubtitle}>Se actualiza con partidos verificados</Text>
            </View>
            <Badge label="--" variant="accent" size="sm" />
          </View>
          <Text style={styles.currentName}>{user?.fullName ?? 'Jugador'}</Text>
          <Text style={styles.currentMeta}>Sin puntos acumulados todavia</Text>
        </Card>

        {topPlayers.length > 0 ? (
          <View style={styles.topGrid}>
            {topPlayers.map((player, index) => (
              <Card key={player.id} variant="elevated" size="md" style={styles.topCard}>
                <Text style={styles.topName}>{player.fullName}</Text>
                <Text style={styles.topPoints}>{player.points} pts</Text>
              </Card>
            ))}
          </View>
        ) : null}

        <Card variant="elevated" size="lg" style={styles.listCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tabla general</Text>
            <Badge label={`${activeClubs}/${clubGoalForPrizes} clubes`} variant="accent" size="sm" />
          </View>

          {ranking.length === 0 ? (
            <EmptyState
              icon={<Medal size={40} color={colors.textTertiary} />}
              title="Ranking vacio"
              description="Cuando haya partidos jugados y verificados por clubes, los puntos van a aparecer aca."
            />
          ) : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing['3xl'], gap: 16 },
  header: { marginBottom: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 26, fontWeight: '800', color: colors.textPrimary },
  helpButton: { padding: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 6, lineHeight: 20 },
  summaryCard: { padding: 16, gap: 8 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: { flex: 1 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  summarySubtitle: { fontSize: 12, color: colors.textSecondary },
  currentName: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  currentMeta: { fontSize: 13, color: colors.textSecondary },
  topGrid: { flexDirection: 'row', gap: 10 },
  topCard: { flex: 1, padding: 12, alignItems: 'center' },
  topName: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  topPoints: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  listCard: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
});
