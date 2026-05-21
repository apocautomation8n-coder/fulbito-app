import { useState } from 'react';
import { Calendar, Edit3, MapPin, Plus } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { AddCourtScreen } from './AddCourtScreen';
import { CourtAvailabilityScreen } from './CourtAvailabilityScreen';
import { formatCurrency } from '../../../config/businessRules';
import { featuredCourts } from '../../../data/mock';
import { colors, spacing, typography } from '../../../theme/theme';

export function ClubCourtsScreen() {
  const [showAddCourt, setShowAddCourt] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<{ id: string; name: string } | null>(null);
  const [clubId] = useState('demo-club'); // TODO: Get from auth context

  if (showAddCourt) {
    return (
      <AddCourtScreen
        clubId={clubId}
        onComplete={() => setShowAddCourt(false)}
        onCancel={() => setShowAddCourt(false)}
      />
    );
  }

  if (showAvailability && selectedCourt) {
    return (
      <CourtAvailabilityScreen
        courtId={selectedCourt.id}
        courtName={selectedCourt.name}
        onComplete={() => {
          setShowAvailability(false);
          setSelectedCourt(null);
        }}
        onCancel={() => {
          setShowAvailability(false);
          setSelectedCourt(null);
        }}
      />
    );
  }

  return (
    <Screen title="Canchas" subtitle="Formatos, precios, duracion y disponibilidad.">
      <Button
        icon={<Plus color={colors.surface} size={18} />}
        label="Agregar cancha"
        onPress={() => setShowAddCourt(true)}
      />

      {featuredCourts.slice(0, 2).map((court) => (
        <Card key={court.id} style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{court.name}</Text>
              <Text style={styles.subtitle}>
                {court.format} · {court.durationMinutes} min · {court.neighborhood}
              </Text>
            </View>
            <Text style={styles.price}>{formatCurrency(court.pricePerSlot)}</Text>
          </View>
          <View style={styles.footer}>
            <View style={styles.meta}>
              <MapPin color={colors.muted} size={16} />
              <Text style={styles.metaText}>Visible en Cordoba</Text>
            </View>
            <View style={styles.actions}>
              <Button
                icon={<Calendar color={colors.ink} size={16} />}
                label="Horarios"
                onPress={() => {
                  setSelectedCourt({ id: court.id, name: court.name });
                  setShowAvailability(true);
                }}
                style={styles.actionButton}
                variant="secondary"
              />
              <Button
                icon={<Edit3 color={colors.ink} size={16} />}
                label="Editar"
                onPress={() => undefined}
                style={styles.actionButton}
                variant="secondary"
              />
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.small,
    marginTop: spacing.xs,
  },
  price: {
    color: colors.primaryDark,
    fontSize: typography.body,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.muted,
    fontSize: typography.small,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
