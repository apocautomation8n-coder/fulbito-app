import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { clubsRepository } from '../../../data/repositories/clubs.repository';
import { colors, spacing, typography } from '../../../theme/theme';
import type { Club } from '../../../data/repositories/clubs.repository';

export function AdminClubsScreen() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadClubs = async () => {
    setIsLoading(true);
    try {
      const pendingClubs = await clubsRepository.getPendingClubs();
      setClubs(pendingClubs);
    } catch (error) {
      Alert.alert('Error', 'No pudimos cargar los clubes pendientes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (club: Club) => {
    Alert.alert(
      'Aprobar club',
      `¿Estás seguro de que quieres aprobar ${club.name}?`,
      [
        { text: 'Cancelar' },
        {
          text: 'Aprobar',
          onPress: async () => {
            try {
              await clubsRepository.approveClub(club.id);
              Alert.alert('Club aprobado', 'El club ha sido aprobado exitosamente.');
              loadClubs();
            } catch (error) {
              Alert.alert('Error', 'No pudimos aprobar el club.');
            }
          },
        },
      ],
    );
  };

  const handleReject = async (club: Club) => {
    Alert.alert(
      'Rechazar club',
      `¿Estás seguro de que quieres rechazar ${club.name}?`,
      [
        { text: 'Cancelar' },
        {
          text: 'Rechazar',
          onPress: async () => {
            try {
              await clubsRepository.rejectClub(club.id);
              Alert.alert('Club rechazado', 'El club ha sido rechazado.');
              loadClubs();
            } catch (error) {
              Alert.alert('Error', 'No pudimos rechazar el club.');
            }
          },
        },
      ],
    );
  };

  return (
    <Screen title="Clubes" subtitle="Aprobación básica para salir con MVP.">
      <Button
        disabled={isLoading}
        label={isLoading ? 'Cargando...' : 'Actualizar'}
        onPress={loadClubs}
        variant="secondary"
      />

      {clubs.length === 0 && !isLoading && (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay clubes pendientes de aprobación.</Text>
        </Card>
      )}

      {clubs.map((club) => (
        <Card key={club.id} style={styles.card}>
          <View>
            <Text style={styles.title}>{club.name}</Text>
            <Text style={styles.subtitle}>
              {club.neighborhood} · {club.city}
            </Text>
            <Text style={styles.email}>{club.address}</Text>
          </View>
          <View style={styles.actions}>
            <Button
              icon={<Check color={colors.surface} size={16} />}
              label="Aprobar"
              onPress={() => handleApprove(club)}
              style={styles.actionButton}
            />
            <Button
              icon={<X color={colors.ink} size={16} />}
              label="Rechazar"
              onPress={() => handleReject(club)}
              style={styles.actionButton}
              variant="secondary"
            />
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.muted,
    fontSize: typography.body,
    textAlign: 'center',
  },
  card: {
    gap: spacing.md,
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
  email: {
    color: colors.primaryDark,
    fontSize: typography.small,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
