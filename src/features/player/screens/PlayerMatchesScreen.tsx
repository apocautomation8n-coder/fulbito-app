import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Calendar, Clock, DollarSign, MapPin, Users, Activity } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { H3, Body, Caption } from '../../../components/ui/Typography';
import { openMatches } from '../../../data/mock';
import { colors, spacing, borderRadius } from '../../../theme/designSystem';
import { formatCurrency } from '../../../config/businessRules';
import type { OpenMatch } from '../../../types/domain';

export function PlayerMatchesScreen() {
  const renderMatchItem = ({ item: match }: { item: OpenMatch }) => {
    const isFull = match.spotsNeeded === 0;

    return (
      <Card variant="elevated" size="md" style={styles.matchCard}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Body style={styles.courtName}>{match.courtName}</Body>
            <View style={styles.locationContainer}>
              <MapPin size={12} color={colors.textSecondary} />
              <Caption style={styles.locationText}>{match.neighborhood} · 2.1 km</Caption>
            </View>
          </View>
          <Badge
            label={isFull ? 'Completo' : `Faltan ${match.spotsNeeded}`}
            variant={isFull ? 'default' : 'accent'}
            size="sm"
          />
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Clock size={14} color={colors.textSecondary} />
            <Caption style={styles.gridValue}>{match.startsAtLabel}</Caption>
          </View>
          <View style={styles.gridItem}>
            <Calendar size={14} color={colors.textSecondary} />
            <Caption style={styles.gridValue}>{match.format}</Caption>
          </View>
          <View style={styles.gridItem}>
            <DollarSign size={14} color={colors.textSecondary} />
            <Caption style={styles.gridValue}>{formatCurrency(match.pricePerPlayer)} c/u</Caption>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Button
            disabled={isFull}
            label={isFull ? 'Completo' : 'Solicitar Unirse'}
            onPress={() => undefined}
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
        data={openMatches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <H3>Tus Partidos</H3>
            <Body style={styles.subtitle}>Gestiona tus convocatorias o únete a partidos creados por otros jugadores.</Body>
          </View>
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
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  joinButton: {
    minHeight: 34,
  },
});

