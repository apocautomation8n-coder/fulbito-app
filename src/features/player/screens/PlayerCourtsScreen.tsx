import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Clock, MapPin, Search, Star, SlidersHorizontal } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Chip } from '../../../components/ui/Chip';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { H3, H4, Body, Caption } from '../../../components/ui/Typography';
import { BookingScreen } from './BookingScreen';
import { businessRules, formatCurrency } from '../../../config/businessRules';
import { featuredCourts } from '../../../data/mock';
import { colors, spacing } from '../../../theme/designSystem';


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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View>
        <View style={styles.header}>
          <H3>Canchas</H3>
          <Body style={styles.subtitle}>Turnos disponibles en {businessRules.launchCity}</Body>
        </View>

        <View style={styles.stats}>
          <Badge label="Comisión 5%" variant="glow" />
          <Badge label="Bloqueo 10 min" variant="default" />
        </View>

        <View style={styles.searchContainer}>
          <Input
            onChangeText={setSearchQuery}
            placeholder="Buscar cancha, club o barrio"
            value={searchQuery}
            variant="glass"
            leftIcon={<Search size={18} color={colors.textSecondary} />}
          />
          <Button
            icon={<SlidersHorizontal size={18} />}
            label="Filtros"
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
            variant="secondary"
            size="md"
          />
        </View>

        {showFilters && (
          <Card variant="glass" size="md" style={styles.filtersCard}>
            <Caption style={styles.filterTitle}>Barrio</Caption>
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

        {filteredCourts.length === 0 ? (
          <EmptyState
            icon={<Search size={48} color={colors.textTertiary} />}
            title="No se encontraron canchas"
            description="Intenta con otros términos de búsqueda o filtros."
          />
        ) : (
          <View style={styles.courtsList}>
            {filteredCourts.map((court, index) => (
              <Card key={court.id} variant="elevated" size="lg" style={styles.courtCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleBlock}>
                    <H4>{court.clubName}</H4>
                    <Body style={styles.courtName}>
                      {court.name} · {court.format}
                    </Body>
                  </View>
                  <Badge label={formatCurrency(court.pricePerSlot)} variant="accent" />
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <MapPin size={16} color={colors.textSecondary} />
                    <Caption>{court.neighborhood} · {court.distanceKm} km</Caption>
                  </View>
                  <View style={styles.metaItem}>
                    <Star size={16} color={colors.accent} />
                    <Caption>{court.rating}</Caption>
                  </View>
                </View>

                <View style={styles.footer}>
                  <View style={styles.metaItem}>
                    <Clock size={16} color={colors.primary} />
                    <Caption style={styles.nextSlot}>{court.nextSlotLabel}</Caption>
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
                    variant="primary"
                    size="md"
                  />
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  filterButton: {
    flexShrink: 0,
  },
  filtersCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  filterTitle: {
    marginBottom: spacing.md,
  },
  neighborhoodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  courtsList: {
    gap: spacing.lg,
  },
  courtCard: {
    padding: spacing.lg,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  titleBlock: {
    flex: 1,
  },
  courtName: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nextSlot: {
    color: colors.primary,
    fontWeight: '600',
  },
});
