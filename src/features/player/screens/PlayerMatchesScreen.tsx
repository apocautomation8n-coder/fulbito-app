import React, { useState } from 'react';
import { StyleSheet, FlatList, View, Text, Pressable, Modal, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, DollarSign, MapPin, Users, User, ArrowLeft, Send, CheckCircle2, Shield } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { openMatches } from '../../../data/mock';
import { useAuth } from '../../../core/providers/AuthProvider';
import { colors, spacing, borderRadius, shadows } from '../../../theme/designSystem';
import { formatCurrency } from '../../../config/businessRules';
import type { OpenMatch } from '../../../types/domain';

const POSITIONS = ['Arquero', 'Defensor', 'Mediocampista', 'Delantero'];

export function PlayerMatchesScreen() {
  const { user } = useAuth();
  const [appliedMatchIds, setAppliedMatchIds] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<OpenMatch | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form states
  const [preferredPosition, setPreferredPosition] = useState('Mediocampista');
  const [contactPhone, setContactPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenApply = (match: OpenMatch) => {
    setSelectedMatch(match);
    // Pre-fill phone from player's profile automatically
    setContactPhone((user as any)?.phone || '+54 351 688-9921');
    setShowApplyModal(true);
  };

  const handleSubmitApplication = () => {
    if (!contactPhone.trim()) {
      Alert.alert('Teléfono requerido', 'Por favor ingresa tu número de contacto para que el organizador pueda agregarte al grupo.');
      return;
    }

    setIsSubmitting(true);
    // Simulate real-time API call and notification send
    setTimeout(() => {
      if (selectedMatch) {
        setAppliedMatchIds((prev) => [...prev, selectedMatch.id]);
      }
      setIsSubmitting(false);
      setShowApplyModal(false);
      setShowSuccessModal(true);
    }, 1200);
  };

  const renderMatchItem = ({ item: match }: { item: OpenMatch }) => {
    const isFull = match.spotsNeeded === 0;
    const hasApplied = appliedMatchIds.includes(match.id);

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
            label={isFull ? 'Completo' : hasApplied ? 'Pendiente' : `Quedan ${match.spotsNeeded}`}
            variant={isFull ? 'default' : hasApplied ? 'warning' : 'accent'}
            size="sm"
          />
        </View>

        {/* Host Details section */}
        <View style={styles.hostRow}>
          <View style={styles.hostAvatar}>
            <User size={14} color={colors.primary} />
          </View>
          <Text style={styles.hostText}>
            Organizado por <Text style={styles.hostHighlight}>{match.hostName || 'Organizador'}</Text>
          </Text>
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
          {hasApplied ? (
            <Button
              disabled
              label="Postulación Enviada"
              onPress={() => undefined}
              variant="secondary"
              size="sm"
              style={styles.appliedButton}
              fullWidth
              icon={<CheckCircle2 size={16} color={colors.textDisabled} />}
            />
          ) : (
            <Button
              disabled={isFull}
              label={isFull ? 'Convocatoria Completa' : 'Postularse al Partido'}
              onPress={() => handleOpenApply(match)}
              variant={isFull ? 'secondary' : 'primary'}
              size="sm"
              style={styles.joinButton}
              fullWidth
            />
          )}
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

        {/* 1. APPLY MODAL (Form & Details) */}
        <Modal
          visible={showApplyModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowApplyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setShowApplyModal(false)} style={styles.backButton}>
                  <ArrowLeft size={20} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.modalTitle}>Postularse</Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                {selectedMatch && (
                  <Card variant="glass" size="md" style={styles.modalMatchInfo}>
                    <Text style={styles.modalMatchTitle}>{selectedMatch.courtName}</Text>
                    <Text style={styles.modalMatchHost}>Organiza: {selectedMatch.hostName}</Text>
                    <View style={styles.modalInfoRow}>
                      <Clock size={14} color={colors.primary} />
                      <Text style={styles.modalInfoText}>{selectedMatch.startsAtLabel}</Text>
                    </View>
                  </Card>
                )}

                {/* Position selection */}
                <Text style={styles.label}>⚽ Posición en la que juegas</Text>
                <View style={styles.positionGrid}>
                  {POSITIONS.map((pos) => {
                    const isSel = preferredPosition === pos;
                    return (
                      <Pressable
                        key={pos}
                        style={[styles.positionChip, isSel && styles.positionChipSel]}
                        onPress={() => setPreferredPosition(pos)}
                      >
                        <Text style={[styles.positionChipText, isSel && styles.positionChipTextSel]}>
                          {pos}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Contact Phone */}
                <Text style={styles.label}>📞 Teléfono de Contacto</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: +54 9 351 1234567"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                  value={contactPhone}
                  onChangeText={setContactPhone}
                />

                {/* Message */}
                <Text style={styles.label}>💬 Mensaje para el Organizador (Opcional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Ej: Hola! Juego de volante ofensivo, avísame si hay lugar."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  value={message}
                  onChangeText={setMessage}
                />

                <Button
                  label={isSubmitting ? 'Enviando...' : 'Enviar Postulación'}
                  onPress={handleSubmitApplication}
                  variant="glow"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  icon={<Send size={18} color="#FFFFFF" />}
                  style={styles.submitButton}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* 2. SUCCESS MODAL */}
        <Modal
          visible={showSuccessModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Card variant="elevated" size="lg" style={styles.successCard}>
              <View style={styles.successIconWrapper}>
                <CheckCircle2 size={48} color={colors.primary} />
              </View>
              <Text style={styles.successTitle}>¡Postulación Enviada! 🎉</Text>
              <Text style={styles.successDesc}>
                Le hemos notificado a <Text style={{ fontWeight: '700' }}>{selectedMatch?.hostName}</Text> sobre tu postulación.
              </Text>

              {/* Supabase Technical Highlight */}
              <View style={styles.supabaseBox}>
                <Shield size={16} color={colors.primary} />
                <Text style={styles.supabaseText}>
                  Nota: Al conectar Supabase, esta acción guardará tu postulación en la tabla 'match_applications' y enviará una notificación push/SMS en tiempo real al administrador.
                </Text>
              </View>

              <Button
                label="Entendido"
                onPress={() => setShowSuccessModal(false)}
                variant="primary"
                size="md"
                fullWidth
              />
            </Card>
          </View>
        </Modal>
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
  appliedButton: {
    minHeight: 38,
    backgroundColor: colors.cardLight,
    borderColor: colors.border,
  },

  // Apply Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    width: '100%',
    height: Platform.OS === 'ios' ? '85%' : '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalScroll: {
    paddingBottom: spacing['3xl'],
    gap: 16,
  },
  modalMatchInfo: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalMatchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalMatchHost: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 8,
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  positionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.cardLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  positionChipSel: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  positionChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  positionChipTextSel: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 12,
  },

  // Success Modal styles
  successCard: {
    backgroundColor: colors.card,
    width: '90%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  successIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  supabaseBox: {
    flexDirection: 'row',
    backgroundColor: colors.cardLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  supabaseText: {
    flex: 1,
    fontSize: 11,
    color: colors.textTertiary,
    lineHeight: 16,
  },
});
