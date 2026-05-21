import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Clock, MapPin, Search, Star, X } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { StatPill } from '../../../components/ui/StatPill';
import { BookingScreen } from './BookingScreen';
import { businessRules, formatCurrency } from '../../../config/businessRules';
import { featuredCourts } from '../../../data/mock';
import { colors, spacing, typography } from '../../../theme/theme';

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
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const neighborhoods = ['Nueva Córdoba', 'Güemes', 'Alta Córdoba', 'Centro', 'General Paz'];

  const filteredCourts = featuredCourts.filter((court) => {
    const matchesSearch = searchQuery === '' || 
      court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesNeighborhood = selectedNeighborhood === '' || court.neighborhood === selectedNeighborhood;
    
    return matchesSearch && matchesNeighborhood;
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
        paymentMode="full"
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
    <Screen title="Canchas" subtitle={`Turnos disponibles en ${businessRules.launchCity}.`}>
      <View style={styles.stats}>
        <StatPill label="Comision Fulbito" value="5%" />
        <StatPill label="Bloqueo de pago" value="10 min" />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Search color={colors.muted} size={18} style={styles.searchIcon} />
          <TextInput
            onChangeText={setSearchQuery}
            placeholder="Buscar por nombre, club o barrio"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={searchQuery}
          />
          {searchQuery.length > 0 && (
            <Button
              icon={<X color={colors.muted} size={16} />}
              label=""
              onPress={() => setSearchQuery('')}
              variant="ghost"
            />
          )}
        </View>
        <Button
          label="Filtros"
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
          variant="secondary"
        />
      </View>

      {showFilters && (
        <Card style={styles.filtersCard}>
          <Text style={styles.filterTitle}>Barrio</Text>
          <View style={styles.neighborhoodsContainer}>
            <Button
              label="Todos"
              onPress={() => setSelectedNeighborhood('')}
              style={styles.neighborhoodButton}
              variant={selectedNeighborhood === '' ? 'primary' : 'secondary'}
            />
            {neighborhoods.map((neighborhood) => (
              <Button
                key={neighborhood}
                label={neighborhood}
                onPress={() => setSelectedNeighborhood(neighborhood)}
                style={styles.neighborhoodButton}
                variant={selectedNeighborhood === neighborhood ? 'primary' : 'secondary'}
              />
            ))}
          </View>
        </Card>
      )}

      {filteredCourts.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No se encontraron canchas.</Text>
          <Text style={styles.emptySubtext}>
            Intenta con otros términos de búsqueda.
          </Text>
        </Card>
      ) : (
        filteredCourts.map((court) => (
          <Card key={court.id} style={styles.courtCard}>
            <View style={styles.cardHeader}>
              <View style={styles.titleBlock}>
                <Text style={styles.club}>{court.clubName}</Text>
                <Text style={styles.courtName}>
                  {court.name} · {court.format}
                </Text>
              </View>
              <Text style={styles.price}>{formatCurrency(court.pricePerSlot)}</Text>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MapPin color={colors.muted} size={16} />
                <Text style={styles.metaText}>
                  {court.neighborhood} · {court.distanceKm} km
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Star color={colors.accent} size={16} />
                <Text style={styles.metaText}>{court.rating}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.metaItem}>
                <Clock color={colors.primary} size={16} />
                <Text style={styles.nextSlot}>{court.nextSlotLabel}</Text>
              </View>
              <Button
                label="Reservar"
                onPress={() => {
                  setSelectedCourt({
                    id: court.id,
                    name: court.name,
                    clubName: court.clubName,
                    format: court.format,
                    pricePerSlot: court.pricePerSlot,
                    durationMinutes: court.durationMinutes,
                  });
                  setShowBooking(true);
                }}
                variant="secondary"
              />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  courtCard: {
    gap: spacing.md,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
  },
  club: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  courtName: {
    color: colors.muted,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  price: {
    color: colors.primaryDark,
    fontSize: typography.body,
    fontWeight: '800',
  },
  metaRow: {
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
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nextSlot: {
    color: colors.primaryDark,
    fontSize: typography.small,
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  searchInput: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    flexDirection: 'row',
    flex: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    zIndex: 1,
  },
  input: {
    backgroundColor: 'transparent',
    color: colors.ink,
    flex: 1,
    fontSize: typography.body,
    minHeight: 40,
    paddingLeft: spacing.lg,
  },
  filterButton: {
    flexShrink: 0,
  },
  filtersCard: {
    gap: spacing.md,
  },
  filterTitle: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '700',
  },
  neighborhoodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  neighborhoodButton: {
    flexShrink: 0,
  },
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
});
