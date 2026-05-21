import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Star, X } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { ratingsRepository } from '../../../data/repositories/ratings.repository';
import { colors, spacing, typography } from '../../../theme/theme';

export function RatePlayerScreen({ playerId, playerName, matchId, onComplete, onCancel }: {
  playerId: string;
  playerName: string;
  matchId: string;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Calificación requerida', 'Por favor selecciona una calificación de 1 a 5 estrellas.');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Get actual rater ID from auth context
      await ratingsRepository.submitRating({
        rater_id: 'demo-player',
        rated_id: playerId,
        match_id: matchId,
        rating,
        comment: comment || null,
      });
      Alert.alert('Calificación enviada', 'Gracias por tu calificación.');
      onComplete();
    } catch (error) {
      Alert.alert('Error', 'No pudimos enviar tu calificación. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen title="Calificar jugador" subtitle={`¿Cómo fue jugar con ${playerName}?`}>
      <Card style={styles.card}>
        <Text style={styles.question}>Califica tu experiencia</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              color={star <= rating ? colors.accent : colors.surfaceMuted}
              fill={star <= rating ? colors.accent : 'none'}
              size={40}
              style={styles.star}
              onPress={() => setRating(star)}
            />
          ))}
        </View>
        <Text style={styles.ratingLabel}>
          {rating === 0 ? 'Selecciona una calificación' : `${rating} de 5`}
        </Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.question}>Comentario (opcional)</Text>
        <Text style={styles.hint}>
          Comparte tu experiencia para ayudar a otros jugadores.
        </Text>
        <Text style={styles.commentPlaceholder}>
          {comment || 'Escribe un comentario...'}
        </Text>
      </Card>

      <View style={styles.actions}>
        <Button
          icon={<X color={colors.ink} size={18} />}
          label="Cancelar"
          onPress={onCancel}
          style={styles.actionButton}
          variant="secondary"
        />
        <Button
          disabled={isSubmitting || rating === 0}
          label={isSubmitting ? 'Enviando...' : 'Enviar calificación'}
          onPress={handleSubmit}
          style={styles.actionButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  question: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '700',
  },
  hint: {
    color: colors.muted,
    fontSize: typography.small,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  star: {
    cursor: 'pointer',
  },
  ratingLabel: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '600',
    textAlign: 'center',
  },
  commentPlaceholder: {
    color: colors.muted,
    fontSize: typography.body,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
