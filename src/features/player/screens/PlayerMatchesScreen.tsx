import React from 'react';
import { StyleSheet, FlatList, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, DollarSign, MapPin, Users, User } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { openMatches } from '../../../data/mock';
import { colors, spacing, borderRadius, shadows } from '../../../theme/designSystem';
import { formatCurrency } from '../../../config/businessRules';
import type { OpenMatch } from '../../../types/domain';

export function PlayerMatchesScreen() {
  const renderMatchItem = ({ item: match }: { item: OpenMatch }) => {
    const isFull = match.spotsNeeded === 0;

    return (
      <Card variant="elevated" size="lg" style={styles.matchCard}>
        {/* Top Header Row of Match */}
        <View style={styles.cardHeader}>
          <View style={styles.courtBadge}>
            <Text style={styles.courtEmoji}>{match.emoji || '⚽'}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.courtName}>{match.courtName}</Text>
            <View style={styles.locationContainer}>
              <MapPin size={13} color={colors.textTertiary} />
              <Text style={styles.locationText}>{match.neighborhood}</Text>
            </View>
          </View>
          <Badge
            label={isFull ? 'Completo' : `Quedan ${match.spotsNeeded}`}
            variant={isFull ? 'default' : 'accent'}
            size="sm"
          />
        </View>

        {/* Host Details section */}
        <View style={styles.hostRow}>
          <View style={styles.hostAvatar}>
            <User size={14} color={colors.primary} />
          </View>
          <Text style={styles.hostText}>Organizado por <Text style={styles.hostHighlight}>{match.hostName || 'Organizador'}</Text></Text>
        </View>

        {/* Parameters Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.gridValue}>{match.startsAtLabel}</Text>
          </View>
          <View style={styles.gridItem}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={styles.gridValue}>{match.format}</Text>
          </View>
          <View style={styles.gridItem}>
            <DollarSign size={14} color={colors.textSecondary} />
            <Text style={styles.gridValue}>{formatCurrency(match.pricePerPlayer)} c/u</Text>
          </View>
        </View>

        {/* Footer Action */}
        <View style={styles.cardFooter}>
          <Button
            disabled={isFull}
            label={isFull ? 'Convocatoria Completa' : 'Postularse al Partido'}
            onPress={() => undefined}
            variant={isFull ? 'secondary' : 'primary'}
            size="sm"
            style={styles.joinButton}
            fullWidth
          />
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <FlatList
          data={openMatches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>Partidos Abiertos</Text>
              <Text style={styles.subtitle}>Súmate a convocatorias creadas por otros jugadores y completa los equipos.</Text>
            </View>
          }
        />
      </View>
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
  listContent: {
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
  matchCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courtBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courtEmoji: {
    fontSize: 22,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  courtName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    color: colors.textTertiary,
    fontSize: 13,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  hostAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  hostHighlight: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  gridContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardLight,
    borderRadius: 10,
    padding: 12,
    gap: 12,
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gridValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  joinButton: {
    minHeight: 38,
  },
});
