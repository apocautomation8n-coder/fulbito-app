import { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Check, X, RefreshCw } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { Badge } from '../../../components/ui/Badge';
import { clubsRepository } from '../../../data/repositories/clubs.repository';
import { colors, spacing, shadows } from '../../../theme/designSystem';
import type { Club } from '../../../data/repositories/clubs.repository';

export function AdminClubsScreen() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadClubs();
  }, []);

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
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar',
          style: 'default',
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
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
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
    <Screen title="Clubes Pendientes" subtitle="Gestiona las solicitudes de nuevos clubes en la plataforma.">
      <View style={styles.headerActions}>
        <Button
          disabled={isLoading}
          label={isLoading ? 'Actualizando...' : 'Actualizar'}
          onPress={loadClubs}
          variant="secondary"
          size="sm"
          icon={<RefreshCw color={colors.textPrimary} size={16} />}
        />
      </View>

      {clubs.length === 0 && !isLoading && (
        <Card variant="elevated" style={styles.emptyCard}>
          <Text style={styles.emptyText}>No hay clubes pendientes de aprobación.</Text>
        </Card>
      )}

      {clubs.map((club) => (
        <Card variant="elevated" key={club.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.title}>{club.name}</Text>
              <Text style={styles.subtitle}>
                {club.neighborhood} · {club.city}
              </Text>
            </View>
            <Badge label="Pendiente" variant="warning" size="sm" />
          </View>
          
          <View style={styles.detailsRow}>
            <Text style={styles.addressLabel}>Dirección:</Text>
            <Text style={styles.addressValue}>{club.address || 'No especificada'}</Text>
          </View>

          <View style={styles.actions}>
            <Button
              icon={<Check color="#FFFFFF" size={16} />}
              label="Aprobar"
              onPress={() => handleApprove(club)}
              style={styles.actionButton}
              variant="glow"
            />
            <Button
              icon={<X color={colors.textPrimary} size={16} />}
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textTertiary,
    fontSize: 14,
    fontWeight: '500',
  },
  detailsRow: {
    backgroundColor: colors.cardLight,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '600',
    marginBottom: 2,
  },
  addressValue: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
