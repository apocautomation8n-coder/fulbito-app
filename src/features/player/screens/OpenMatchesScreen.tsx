import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Calendar, Clock, DollarSign, MapPin, Users } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { matchesRepository } from '../../../data/repositories/matches.repository';
import { businessRules, formatCurrency } from '../../../config/businessRules';
import { colors, spacing, typography } from '../../../theme/theme';
import type { Match } from '../../../data/repositories/matches.repository';

export function OpenMatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

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
              // TODO: Get actual player ID from auth context
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

  const getSpotsLabel = (match: Match) => {
    const available = getSpotsAvailable(match);
    if (available === 0) return 'Completo';
    if (available <= 2) return `${available} lugares`;
    return `${available}/${match.spots_total} lugares`;
  };

  return (
    <Screen title="Partidos abiertos" subtitle="Únete a partidos abiertos por otros jugadores.">
      <Button
        disabled={isLoading}
        label={isLoading ? 'Cargando...' : 'Actualizar'}
        onPress={loadMatches}
        variant="secondary"
      />

      {matches.length === 0 && !isLoading && (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay partidos abiertos en este momento.</Text>
          <Text style={styles.emptySubtext}>
            Vuelve más tarde para ver partidos disponibles.
          </Text>
        </Card>
      )}

      {matches.map((match) => {
        const spotsAvailable = getSpotsAvailable(match);
        const isFull = spotsAvailable === 0;

        return (
          <Card key={match.id} style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <View>
                <Text style={styles.matchTitle}>Partido abierto</Text>
                <Text style={styles.matchSubtitle}>{match.description || 'Sin descripción'}</Text>
              </View>
              <View style={[styles.spotsBadge, isFull && styles.spotsBadgeFull]}>
                <Users color={isFull ? colors.ink : colors.surface} size={14} />
                <Text style={[styles.spotsText, isFull && styles.spotsTextFull]}>
                  {getSpotsLabel(match)}
                </Text>
              </View>
            </View>

            <View style={styles.matchMeta}>
              <View style={styles.metaItem}>
                <Calendar color={colors.muted} size={16} />
                <Text style={styles.metaText}>
                  {new Date(match.created_at).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Clock color={colors.muted} size={16} />
                <Text style={styles.metaText}>
                  {new Date(match.created_at).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.matchMeta}>
              <View style={styles.metaItem}>
                <MapPin color={colors.muted} size={16} />
                <Text style={styles.metaText}>Córdoba</Text>
              </View>
              <View style={styles.metaItem}>
                <DollarSign color={colors.muted} size={16} />
                <Text style={styles.metaText}>{formatCurrency(match.price_per_player)}</Text>
              </View>
            </View>

            {match.is_split_payment && (
              <View style={styles.splitInfo}>
                <Text style={styles.splitText}>
                  Pagos divididos · Deadline: {businessRules.defaultSplitDeadlineHoursBeforeKickoff}h antes
                </Text>
              </View>
            )}

            <Button
              disabled={isFull}
              label={isFull ? 'Completo' : 'Unirse'}
              onPress={() => handleJoinMatch(match)}
              variant={isFull ? 'secondary' : 'primary'}
            />
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    color: colors.muted,
    fontSize: typography.small,
    textAlign: 'center',
  },
  matchCard: {
    gap: spacing.md,
  },
  matchHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  matchTitle: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  matchSubtitle: {
    color: colors.muted,
    fontSize: typography.small,
    marginTop: spacing.xs,
  },
  spotsBadge: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  spotsBadgeFull: {
    backgroundColor: colors.surfaceMuted,
  },
  spotsText: {
    color: colors.surface,
    fontSize: typography.tiny,
    fontWeight: '700',
  },
  spotsTextFull: {
    color: colors.ink,
  },
  matchMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.muted,
    fontSize: typography.small,
  },
  splitInfo: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    padding: spacing.sm,
  },
  splitText: {
    color: colors.ink,
    fontSize: typography.tiny,
    textAlign: 'center',
  },
});
