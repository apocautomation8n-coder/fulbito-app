import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, MapPin, Search, Star, SlidersHorizontal, Calendar, Info } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Chip } from '../../../components/ui/Chip';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BookingScreen } from './BookingScreen';
import { businessRules, formatCurrency } from '../../../config/businessRules';
import { featuredCourts } from '../../../data/mock';
import { colors, spacing, borderRadius, shadows } from '../../../theme/designSystem';
import type { CourtSport } from '../../../types/domain';

type SportFilter = 'all' | CourtSport;

const sportFilters: Array<{ label: string; value: SportFilter }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Futbol', value: 'football' },
  { label: 'Padel', value: 'padel' },
];

const getSportLabel = (sport: CourtSport) => (sport === 'padel' ? 'Padel' : 'Futbol');
const getCourtFormatLabel = (sport: CourtSport, format: string) => (sport === 'padel' && format === 'other' ? '2v2' : format);

export function PlayerCourtsScreen() {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<{
    id: string;
    name: string;
    clubName: string;
    format: string;
    pricePerSlot: number;
    durationMinutes: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<SportFilter>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const neighborhoods = ['Nueva Cordoba', 'Guemes', 'Alta Cordoba', 'Centro', 'General Paz'];

  const filteredCourts = featuredCourts.filter((court) => {
    const matchesSearch = searchQuery === '' || 
      court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getSportLabel(court.sport).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSport = selectedSport === 'all' || court.sport === selectedSport;
    const matchesNeighborhood = selectedNeighborhood === '' || court.neighborhood === selectedNeighborhood;
    
    return matchesSearch && matchesSport && matchesNeighborhood;
  });

  if (showBooking && selectedCourt) {
    return (
      <BookingScreen
        courtId={selectedCourt.id}
        courtName={selectedCourt.name}
        clubName={selectedCourt.clubName}
        format={selectedCourt.format}
        pricePerSlot={selectedCourt.pricePerSlot}
        durationMinutes={selectedCourt.durationMinutes}
        paymentMode="at_club"
        onComplete={() => {
          setShowBooking(false);
          setSelectedCourt(null);
        }}
        onCancel={() => {
          setShowBooking(false);
          setSelectedCourt(null);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reservar Canchas</Text>
          <Text style={styles.subtitle}>Encuentra turnos de futbol y padel en {businessRules.launchCity}</Text>
          <View style={styles.sportQuickFilters}>
            {sportFilters.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={selectedSport === option.value}
                onSelect={() => setSelectedSport(option.value)}
                variant={selectedSport === option.value ? 'primary' : 'outline'}
                size="sm"
              />
            ))}
          </View>
        </View>

        {/* Search and Filters Toggle */}
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Input
              onChangeText={setSearchQuery}
              placeholder="Buscar cancha, club o barrio..."
              value={searchQuery}
              variant="glass"
              leftIcon={<Search size={18} color={colors.textSecondary} />}
            />
          </View>
          <Button
            icon={<SlidersHorizontal size={18} color={showFilters ? colors.background : colors.textPrimary} />}
            label=""
            onPress={() => setShowFilters(!showFilters)}
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            variant={showFilters ? 'primary' : 'secondary'}
            size="md"
          />
        </View>

        {/* Dynamic Filters Panel */}
        {showFilters && (
          <Card variant="glass" size="md" style={styles.filtersCard}>
            <Text style={styles.filterTitle}>Filtrar por Deporte</Text>
            <View style={styles.neighborhoodsContainer}>
              {sportFilters.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={selectedSport === option.value}
                  onSelect={() => setSelectedSport(option.value)}
                  variant={selectedSport === option.value ? 'primary' : 'outline'}
                  size="sm"
                />
              ))}
            </View>

            <Text style={styles.filterTitle}>Filtrar por Barrio</Text>
            <View style={styles.neighborhoodsContainer}>
              <Chip
                label="Todos"
                selected={selectedNeighborhood === ''}
                onSelect={() => setSelectedNeighborhood('')}
                variant={selectedNeighborhood === '' ? 'primary' : 'outline'}
                size="sm"
              />
              {neighborhoods.map((neighborhood) => (
                <Chip
                  key={neighborhood}
                  label={neighborhood}
                  selected={selectedNeighborhood === neighborhood}
                  onSelect={() => setSelectedNeighborhood(neighborhood)}
                  variant={selectedNeighborhood === neighborhood ? 'primary' : 'outline'}
                  size="sm"
                />
              ))}
            </View>
          </Card>
        )}

        {/* Courts List */}
        {filteredCourts.length === 0 ? (
          <EmptyState
            icon={<Search size={48} color={colors.textTertiary} />}
            title="No se encontraron canchas"
            description="Intenta cambiar los terminos de busqueda o los filtros de barrio."
          />
        ) : (
          <View style={styles.courtsList}>
            {filteredCourts.map((court) => (
              <Card key={court.id} variant="elevated" size="lg" style={styles.courtCard}>
                {/* Visual Header with Emoji and Club Rating */}
                <View style={styles.cardHeader}>
                  <View style={styles.courtBadge}>
                    <Text style={styles.courtEmoji}>{court.emoji || 'F5'}</Text>
                  </View>
                  <View style={styles.titleBlock}>
                    <Text style={styles.clubName}>{court.clubName}</Text>
                    <Text style={styles.courtName}>
                      {court.name} - {getCourtFormatLabel(court.sport, court.format)}
                    </Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.ratingText}>{court.rating.toFixed(1)}</Text>
                  </View>
                </View>

                {/* Tags Row */}
                <View style={styles.tagsRow}>
                  {court.surfaceType && (
                    <Badge label={court.surfaceType} variant="default" size="sm" />
                  )}
                  <Badge label={getSportLabel(court.sport)} variant="accent" size="sm" />
                  <Badge label={`${court.durationMinutes} min`} variant="default" size="sm" />
                  <Badge label="Verificado" variant="glow" size="sm" />
                </View>

                {/* Meta details */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <MapPin size={16} color={colors.textTertiary} />
                    <Text style={styles.metaText}>{court.neighborhood} - {court.distanceKm} km</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Footer block with Next Slot and Price & Action */}
                <View style={styles.cardFooter}>
                  <View style={styles.slotBlock}>
                    <Text style={styles.nextSlotLabel}>Proximo turno</Text>
                    <View style={styles.slotDetail}>
                      <Clock size={14} color={colors.primary} />
                      <Text style={styles.slotTime}>{court.nextSlotLabel}</Text>
                    </View>
                  </View>

                  <View style={styles.actionBlock}>
                    <Text style={styles.priceText}>{formatCurrency(court.pricePerSlot)}</Text>
                    <Button
                      label="Reservar"
                      onPress={() => {
                        setSelectedCourt({
                          id: court.id,
                          name: court.name,
                          clubName: court.clubName,
                          format: getCourtFormatLabel(court.sport, court.format),
                          pricePerSlot: court.pricePerSlot,
                          durationMinutes: court.durationMinutes,
                        });
                        setShowBooking(true);
                      }}
                      variant="primary"
                      size="sm"
                      style={styles.reserveButton}
                    />
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
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
  sportQuickFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
  },
  filterButton: {
    aspectRatio: 1,
    paddingHorizontal: 0,
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filtersCard: {
    padding: spacing.md,
    marginBottom: 16,
    backgroundColor: colors.card,
    borderColor: colors.border,
    ...shadows.sm,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 10,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  neighborhoodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  courtsList: {
    gap: 16,
  },
  courtCard: {
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
  titleBlock: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  courtName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotBlock: {
    flex: 1,
  },
  nextSlotLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  slotDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  actionBlock: {
    alignItems: 'flex-end',
    gap: 4,
  },
  priceText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  reserveButton: {
    minHeight: 36,
    paddingHorizontal: 16,
  },
});
