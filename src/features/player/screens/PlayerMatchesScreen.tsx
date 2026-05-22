import React, { useState } from 'react';
import { StyleSheet, FlatList, View, Text, Pressable, Modal, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, DollarSign, Flag, MapPin, Trophy, Users, User, ArrowLeft, Send, CheckCircle2, Shield } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { openMatches } from '../../../data/mock';
import { useAuth } from '../../../core/providers/AuthProvider';
import { colors, spacing, borderRadius, shadows } from '../../../theme/designSystem';
import { formatCurrency } from '../../../config/businessRules';
import type { CourtSport, OpenMatch } from '../../../types/domain';

const POSITIONS = ['Arquero', 'Defensor', 'Mediocampista', 'Delantero'];
const PADEL_POSITIONS = ['Drive', 'Reves', 'Indistinto'];

type SportFilter = 'all' | CourtSport;

const sportFilters: Array<{ label: string; value: SportFilter }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Futbol', value: 'football' },
  { label: 'Padel', value: 'padel' },
];

const getSportLabel = (sport: CourtSport) => (sport === 'padel' ? 'Padel' : 'Futbol');
const getFormatLabel = (sport: CourtSport, format: string) => (sport === 'padel' && format === 'other' ? '2v2' : format);

type Winner = 'A' | 'B' | 'draw';

type MatchResultState = {
  winner: Winner | null;
  confirmations: number;
  disputed: boolean;
  closed: boolean;
};

export function PlayerMatchesScreen() {
  const { user } = useAuth();
  const [appliedMatchIds, setAppliedMatchIds] = useState<string[]>([]);
  const [selectedSport, setSelectedSport] = useState<SportFilter>('all');
  const [selectedMatch, setSelectedMatch] = useState<OpenMatch | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [resultState, setResultState] = useState<MatchResultState>({
    winner: null,
    confirmations: 0,
    disputed: false,
    closed: false,
  });

  // Form states
  const [preferredPosition, setPreferredPosition] = useState('Mediocampista');
  const [contactPhone, setContactPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const filteredMatches = openMatches.filter((match) => selectedSport === 'all' || match.sport === selectedSport);
  const positionOptions = selectedMatch?.sport === 'padel' ? PADEL_POSITIONS : POSITIONS;

  const handleOpenApply = (match: OpenMatch) => {
    setSelectedMatch(match);
    setPreferredPosition(match.sport === 'padel' ? 'Indistinto' : 'Mediocampista');
    // Pre-fill phone from player's profile automatically
    setContactPhone((user as any)?.phone || '+54 351 688-9921');
    setShowApplyModal(true);
  };

  const handleSubmitApplication = () => {
    if (!contactPhone.trim()) {
      Alert.alert('Telefono requerido', 'Por favor ingresa tu numero de contacto para que el organizador pueda agregarte al grupo.');
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

  const getWinnerLabel = (winner: Winner | null) => {
    if (winner === 'A') return 'Gano Equipo A';
    if (winner === 'B') return 'Gano Equipo B';
    if (winner === 'draw') return 'Empate';
    return 'Sin resultado';
  };

  const declareResult = (winner: Winner) => {
    setResultState({
      winner,
      confirmations: 0,
      disputed: false,
      closed: false,
    });
  };

  const confirmResult = () => {
    setResultState((current) => {
      const confirmations = current.confirmations + 1;
      return {
        ...current,
        confirmations,
        closed: confirmations >= 2,
      };
    });
  };

  const disputeResult = () => {
    setResultState((current) => ({
      ...current,
      disputed: true,
      closed: true,
    }));
  };

  const resetResultDemo = () => {
    setResultState({
      winner: null,
      confirmations: 0,
      disputed: false,
      closed: false,
    });
  };

  const renderResultCard = () => {
    const hasResult = resultState.winner !== null;
    const verified = resultState.closed && !resultState.disputed && resultState.confirmations >= 2;
    const disputed = resultState.closed && resultState.disputed;

    return (
      <Card variant="elevated" size="lg" style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View style={styles.resultIcon}>
            <Trophy size={20} color={colors.primary} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.resultTitle}>Resultado pendiente</Text>
            <Text style={styles.resultSubtitle}>Club Centenario - Cancha B</Text>
          </View>
          <Badge
            label={verified ? 'Verificado' : disputed ? 'Disputa' : hasResult ? 'A confirmar' : 'Organizador'}
            variant={verified ? 'success' : disputed ? 'danger' : 'warning'}
            size="sm"
          />
        </View>

        <View style={styles.teamsBox}>
          <View style={styles.teamColumn}>
            <Text style={styles.teamName}>Equipo A</Text>
            <Text style={styles.teamPlayers}>Ezequiel, Mateo, Julian</Text>
          </View>
          <Text style={styles.vsText}>vs</Text>
          <View style={styles.teamColumn}>
            <Text style={styles.teamName}>Equipo B</Text>
            <Text style={styles.teamPlayers}>Santi, Fran, Nacho</Text>
          </View>
        </View>

        <Text style={styles.resultRule}>
          El club valida asistencia. El resultado lo declara el organizador y se confirma entre jugadores.
          Si hay disputa, el partido cierra sin sumar victoria.
        </Text>

        {!hasResult && (
          <View style={styles.resultActions}>
            <Button label="Gano A" onPress={() => declareResult('A')} size="sm" style={styles.resultButton} />
            <Button label="Gano B" onPress={() => declareResult('B')} size="sm" style={styles.resultButton} />
            <Button label="Empate" onPress={() => declareResult('draw')} size="sm" variant="secondary" style={styles.resultButton} />
          </View>
        )}

        {hasResult && !resultState.closed && (
          <View style={styles.resultFlowBox}>
            <Text style={styles.resultDeclared}>{getWinnerLabel(resultState.winner)}</Text>
            <Text style={styles.resultMeta}>{resultState.confirmations}/2 confirmaciones para acreditar victoria.</Text>
            <View style={styles.resultActions}>
              <Button
                icon={<CheckCircle2 size={16} color="#FFFFFF" />}
                label="Confirmar"
                onPress={confirmResult}
                size="sm"
                style={styles.resultButton}
              />
              <Button
                icon={<Flag size={16} color={colors.danger} />}
                label="Disputar"
                onPress={disputeResult}
                size="sm"
                variant="danger"
                style={styles.resultButton}
              />
            </View>
          </View>
        )}

        {verified && (
          <View style={styles.resultClosedBox}>
            <Text style={styles.resultClosedTitle}>Victoria acreditada</Text>
            <Text style={styles.resultClosedText}>Suma partido jugado para asistentes y victoria para el equipo ganador.</Text>
          </View>
        )}

        {disputed && (
          <View style={styles.resultClosedBox}>
            <Text style={styles.resultClosedTitle}>Cerrado con disputa</Text>
            <Text style={styles.resultClosedText}>Suma partido jugado para asistentes, pero no suma victoria a ningun equipo.</Text>
          </View>
        )}

        {resultState.closed && (
          <Button label="Reiniciar demo" onPress={resetResultDemo} variant="secondary" size="sm" fullWidth />
        )}
      </Card>
    );
  };

  const renderMatchItem = ({ item: match }: { item: OpenMatch }) => {
    const isFull = match.spotsNeeded === 0;
    const hasApplied = appliedMatchIds.includes(match.id);

    return (
      <Card variant="elevated" size="lg" style={styles.matchCard}>
        {/* Top Header Row of Match */}
        <View style={styles.cardHeader}>
          <View style={styles.courtBadge}>
            <Text style={styles.courtEmoji}>{match.emoji || 'Futbol'}</Text>
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
            <Users size={14} color={colors.textSecondary} />
            <Text style={styles.gridValue}>{getSportLabel(match.sport)}</Text>
          </View>
          <View style={styles.gridItem}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.gridValue}>{match.startsAtLabel}</Text>
          </View>
          <View style={styles.gridItem}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={styles.gridValue}>{getFormatLabel(match.sport, match.format)}</Text>
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
              label="Postulacion enviada"
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
              label={isFull ? 'Convocatoria completa' : 'Postularse al partido'}
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
          data={filteredMatches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>Partidos Abiertos</Text>
              <Text style={styles.subtitle}>Sumate a convocatorias de futbol y padel creadas por otros jugadores.</Text>
              <View style={styles.sportFilters}>
                {sportFilters.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => setSelectedSport(option.value)}
                    style={[styles.sportChip, selectedSport === option.value && styles.sportChipSelected]}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.sportChipText, selectedSport === option.value && styles.sportChipTextSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {renderResultCard()}
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
                <Text style={styles.label}>{selectedMatch?.sport === 'padel' ? 'Lado preferido' : 'Posicion en la que juegas'}</Text>
                <View style={styles.positionGrid}>
                  {positionOptions.map((pos) => {
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
                <Text style={styles.label}>Telefono de contacto</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: +54 9 351 1234567"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                  value={contactPhone}
                  onChangeText={setContactPhone}
                />

                {/* Message */}
                <Text style={styles.label}>Mensaje para el organizador (opcional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Ej: Hola! Juego de volante ofensivo, avisame si hay lugar."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  value={message}
                  onChangeText={setMessage}
                />

                <Button
                  label={isSubmitting ? 'Enviando...' : 'Enviar postulacion'}
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
              <Text style={styles.successTitle}>Postulacion enviada</Text>
              <Text style={styles.successDesc}>
                Le avisamos a <Text style={{ fontWeight: '700' }}>{selectedMatch?.hostName}</Text> sobre tu postulacion.
              </Text>

              {/* Supabase Technical Highlight */}
              <View style={styles.supabaseBox}>
                <Shield size={16} color={colors.primary} />
                <Text style={styles.supabaseText}>
                  Nota: Al conectar Supabase, esta accion guardara tu postulacion y enviara una notificacion al organizador.
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
  sportFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  sportChip: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sportChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  sportChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  sportChipTextSelected: {
    color: '#FFFFFF',
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
  resultCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginTop: 16,
    padding: 16,
    ...shadows.md,
  },
  resultHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  resultIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  resultTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  resultSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  teamsBox: {
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  teamColumn: {
    flex: 1,
  },
  teamName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  teamPlayers: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 2,
  },
  vsText: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: '800',
  },
  resultRule: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  resultActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resultButton: {
    flexGrow: 1,
  },
  resultFlowBox: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  resultDeclared: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  resultMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  resultClosedBox: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  resultClosedTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  resultClosedText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 4,
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
