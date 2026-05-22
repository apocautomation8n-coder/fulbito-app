import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Apple, LogIn, Mail, UserPlus, Trophy, Users, Shield } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Chip } from '../../../components/ui/Chip';
import { SignUpScreen } from './SignUpScreen';
import { businessRules } from '../../../config/businessRules';
import { company } from '../../../config/company';
import { colors, spacing, borderRadius, shadows } from '../../../theme/designSystem';
import type { UserRole } from '../../../types/domain';
import { useAuth } from '../../../core/providers/AuthProvider';

const roleOptions: Array<{ label: string; value: UserRole; icon: React.ReactNode }> = [
  { label: 'Jugador', value: 'player', icon: <Users size={16} color={colors.textSecondary} /> },
  { label: 'Club', value: 'club', icon: <Trophy size={16} color={colors.textSecondary} /> },
  { label: 'Admin', value: 'admin', icon: <Shield size={16} color={colors.textSecondary} /> },
];

export function AuthScreen() {
  const { isConfigured, signInDemo, signInWithOAuth, signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('player');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const handlePasswordSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithPassword(email, password, role);
    } catch (error) {
      Alert.alert('No pudimos entrar', error instanceof Error ? error.message : 'Revisa tus datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setIsSubmitting(true);
    try {
      await signInWithOAuth(provider);
    } catch (error) {
      Alert.alert('Login no disponible', error instanceof Error ? error.message : 'Configura Supabase OAuth.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSignUp) {
    return <SignUpScreen defaultRole={role} onBack={() => setShowSignUp(false)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* ── Hero Section ── */}
          <View style={styles.hero}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>⚽</Text>
            </View>
            <Text style={styles.brandName}>{businessRules.appName}</Text>
            <Text style={styles.tagline}>Canchas, pagos y partidos{'\n'}en Córdoba.</Text>
            <View style={styles.accentLine} />
          </View>

          {/* ── Form Card ── */}
          <View style={styles.formCard}>
            {/* Role Selector */}
            <Text style={styles.sectionLabel}>Ingresar como</Text>
            <View style={styles.roleSelector}>
              {roleOptions.map((option) => {
                const isSelected = role === option.value;
                const iconColor = isSelected ? '#FFFFFF' : colors.textSecondary;
                const iconElement = option.icon
                  ? React.cloneElement(option.icon as React.ReactElement<{ color?: string }>, { color: iconColor })
                  : null;

                return (
                  <Chip
                    key={option.value}
                    label={option.label}
                    icon={iconElement}
                    selected={isSelected}
                    onSelect={() => setRole(option.value)}
                    variant={isSelected ? 'primary' : 'outline'}
                    size="md"
                  />
                );
              })}
            </View>

            {/* Inputs */}
            <View style={styles.inputGroup}>
              <Input
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Email"
                value={email}
                variant="glass"
                label="Email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Input
                onChangeText={setPassword}
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                variant="glass"
                label="Contraseña"
              />
            </View>

            {/* Primary CTA */}
            <Button
              disabled={isSubmitting}
              icon={<LogIn size={18} color="#FFFFFF" />}
              label={isConfigured ? 'Iniciar sesión' : 'Entrar demo'}
              onPress={handlePasswordSignIn}
              variant="glow"
              size="lg"
              fullWidth
              loading={isSubmitting}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continuar con</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* OAuth Buttons */}
            <View style={styles.oauthRow}>
              <Button
                disabled={isSubmitting}
                icon={<Mail size={18} color={colors.textPrimary} />}
                label="Google"
                onPress={() => handleOAuth('google')}
                style={styles.oauthButton}
                variant="secondary"
                size="md"
              />
              <Button
                disabled={isSubmitting}
                icon={<Apple size={18} color={colors.textPrimary} />}
                label="Apple"
                onPress={() => handleOAuth('apple')}
                style={styles.oauthButton}
                variant="secondary"
                size="md"
              />
            </View>

            {/* Sign Up / Demo */}
            {isConfigured && (
              <Button
                icon={<UserPlus size={18} color={colors.primary} />}
                label="Crear cuenta"
                onPress={() => setShowSignUp(true)}
                variant="ghost"
                size="md"
                fullWidth
              />
            )}

            {!isConfigured && (
              <View style={styles.demoSection}>
                <Text style={styles.demoLabel}>Acceso rápido demo</Text>
                <View style={styles.demoRow}>
                  <Button label="Jugador" onPress={() => signInDemo('player')} variant="ghost" size="sm" />
                  <Button label="Club" onPress={() => signInDemo('club')} variant="ghost" size="sm" />
                  <Button label="Admin" onPress={() => signInDemo('admin')} variant="ghost" size="sm" />
                </View>
              </View>
            )}
          </View>

          {/* ── Footer ── */}
          <Text style={styles.footer}>
            18+ · Pago online · Clubes verificados{'\n'}{company.legalName}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  // ── Hero ──
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 32,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  accentLine: {
    width: 40,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 16,
  },

  // ── Form ──
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },

  // ── Divider ──
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textTertiary,
    paddingHorizontal: 12,
  },

  // ── OAuth ──
  oauthRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  oauthButton: {
    flex: 1,
  },

  // ── Demo ──
  demoSection: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  demoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textTertiary,
    marginBottom: 8,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },

  // ── Footer ──
  footer: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
