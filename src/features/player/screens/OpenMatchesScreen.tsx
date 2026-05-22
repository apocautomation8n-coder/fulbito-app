import { useState, useEffect } from 'react';
import { Alert, StyleSheet, FlatList, View, RefreshControl } from 'react-native';
import { Calendar, Clock, DollarSign, MapPin, Users, RefreshCw, Activity } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { H3, Body, Caption } from '../../../components/ui/Typography';
import { matchesRepository } from '../../../data/repositories/matches.repository';
import { businessRules, formatCurrency } from '../../../config/businessRules';
import { colors, spacing, borderRadius } from '../../../theme/designSystem';
import type { Match } from '../../../data/repositories/matches.repository';

export function OpenMatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setIsLoading(true);
    try {
      const openMatches = await matchesRepository.getOpenMatches();
      setMatches(openMatches);
    } catch (error) {
      Alert.alert('Error', 'No pudimos cargar los partidos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMatch = async (match: Match) => {
    Alert.alert(
      'Unirse al partido',
      `¿Quieres unirte a este partido? El costo es ${formatCurrency(match.price_per_player)}.`,
      [
        { text: 'Cancelar' },
        {
          text: 'Unirse',
          onPress: async () => {
            try {
              await matchesRepository.requestToJoin({
                match_id: match.id,
                player_id: 'demo-player',
              });
              Alert.alert('Solicitud enviada', 'Tu solicitud ha sido enviada al organizador.');
              loadMatches();
            } catch (error) {
              Alert.alert('Error', 'No pudimos enviar la solicitud.');
            }
          },
        },
      ],
    );
  };

  const getSpotsAvailable = (match: Match) => {
    return match.spots_total - match.spots_taken;
  };

  const renderMatchCard = ({ item: match }: { item: Match }) => {
    const spotsAvailable = getSpotsAvailable(match);
    const isFull = spotsAvailable === 0;

    // Format dates cleanly
    const matchDate = new Date(match.created_at);
    const formattedDate = matchDate.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
    });
    const formattedTime = matchDate.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' hs';

    return (
      <Card variant="elevated" size="md" style={styles.matchCard}>
        {/* Main Header: Court & Distance */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Body style={styles.courtName}>{match.description || 'Partido F5'}</Body>
            <View style={styles.locationContainer}>
              <MapPin size={12} color={colors.textSecondary} />
              <Caption style={styles.locationText}>Club Centenario · 1.5 km</Caption>
            </View>
          </View>
          <Badge
            label={isFull ? 'Completo' : `Quedan ${spotsAvailable} spots`}
            variant={isFull ? 'default' : 'accent'}
            size="sm"
          />
        </View>

        {/* Info Grid for Quick Scanning */}
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Clock size={14} color={colors.textSecondary} />
            <Caption style={styles.gridValue}>{formattedTime}</Caption>
          </View>
          <View style={styles.gridItem}>
            <Calendar size={14} color={colors.textSecondary} />
            <Caption style={styles.gridValue}>{formattedDate}</Caption>
          </View>
          <View style={styles.gridItem}>
            <Activity size={14} color={colors.textSecondary} />
            <Caption style={styles.gridValue}>Nivel: Medio</Caption>
          </View>
        </View>

        {/* Players capacity bar (Spotify-like visual cues) */}
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${(match.spots_taken / match.spots_total) * 100}%` }
            ]} 
          />
        </View>
        <View style={styles.progressLabelContainer}>
          <Caption style={styles.progressLabel}>
            {match.spots_taken} de {match.spots_total} listos
          </Caption>
          <Caption style={styles.pricePerPlayer}>
            {formatCurrency(match.price_per_player)} / jug
          </Caption>
        </View>

        {/* Split Payment Badge & CTA */}
        <View style={styles.cardFooter}>
          {match.is_split_payment ? (
            <View style={styles.splitPaymentBadge}>
              <DollarSign size={12} color={colors.primary} />
              <Caption style={styles.splitPaymentText}>Pago Dividido</Caption>
            </View>
          ) : (
            <View />
          )}

          <Button
            disabled={isFull}
            label={isFull ? 'Completo' : 'Unirse al Partido'}
            onPress={() => handleJoinMatch(match)}
            variant={isFull ? 'secondary' : 'primary'}
            size="sm"
            style={styles.joinButton}
          />
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchCard}
        contentContainerStyle={styles.listContent}
        initialNumToRender={8}
        windowSize={5}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadMatches}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <H3>Partidos Abiertos</H3>
            <Body style={styles.subtitle}>Únete a partidos organizados por la comunidad en tiempo real</Body>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon={<Activity size={40} color={colors.textTertiary} />}
              title="No hay partidos abiertos"
              description="Vuelve más tarde para ver partidos disponibles en tu zona."
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  matchCard: {
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  courtName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  locationText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  gridItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  gridValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  pricePerPlayer: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 11,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  splitPaymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(101, 243, 106, 0.08)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  splitPaymentText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 10,
  },
  joinButton: {
    minHeight: 34,
    paddingHorizontal: spacing.md,
  },
});

