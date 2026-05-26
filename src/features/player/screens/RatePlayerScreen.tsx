import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Star, X, Check } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { H3, Body, Caption } from '../../../components/ui/Typography';
import { useAuth } from '../../../core/providers/AuthProvider';
import { ratingsRepository } from '../../../data/repositories/ratings.repository';
import { colors, spacing, borderRadius } from '../../../theme/designSystem';

export function RatePlayerScreen({ playerId, playerName, matchId, onComplete, onCancel }: {
  playerId: string;
  playerName: string;
  matchId: string;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
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
      await ratingsRepository.submitRating({
        rater_id: user?.id ?? '',
        rated_id: playerId,
        match_id: matchId,
        rating,
        comment: comment.trim() || null,
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
    <View style={styles.container}>
      <View style={styles.header}>
        <H3>Calificar Jugador</H3>
        <Body style={styles.subtitle}>¿Cómo fue jugar con {playerName}?</Body>
      </View>

      <Card variant="elevated" size="lg" style={styles.card}>
        <Body style={styles.question}>Califica tu experiencia</Body>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              color={star <= rating ? colors.primary : colors.border}
              fill={star <= rating ? colors.primary : 'none'}
              size={36}
              style={styles.star}
              onPress={() => setRating(star)}
            />
          ))}
        </View>
        <Caption style={styles.ratingLabel}>
          {rating === 0 ? 'Toca una estrella para calificar' : `${rating} de 5 estrellas`}
        </Caption>
      </Card>

      <Card variant="elevated" size="lg" style={styles.card}>
        <Body style={styles.question}>Comentario (opcional)</Body>
        <Caption style={styles.hint}>
          Comparte tu experiencia para ayudar a mantener el fair play en la comunidad.
        </Caption>
        <Input
          multiline
          numberOfLines={3}
          onChangeText={setComment}
          placeholder="Ej: Muy buen jugador, gran actitud..."
          value={comment}
          variant="glass"
          style={styles.textArea}
        />
      </Card>

      <View style={styles.actions}>
        <Button
          icon={<X size={16} color={colors.textPrimary} />}
          label="Cancelar"
          onPress={onCancel}
          style={styles.actionButton}
          variant="secondary"
        />
        <Button
          disabled={isSubmitting || rating === 0}
          icon={<Check size={16} color={colors.background} />}
          label={isSubmitting ? 'Enviando...' : 'Enviar'}
          onPress={handleSubmit}
          style={styles.actionButton}
          variant="primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  question: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  star: {
    marginHorizontal: spacing.xs,
  },
  ratingLabel: {
    color: colors.textTertiary,
    fontSize: 12,
    textAlign: 'center',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
  },
});

