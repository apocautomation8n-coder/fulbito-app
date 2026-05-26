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
import { LogIn, UserPlus, Trophy, Users, Shield } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Chip } from '../../../components/ui/Chip';
import { SignUpScreen } from './SignUpScreen';
import { businessRules } from '../../../config/businessRules';
import { company } from '../../../config/company';
import { colors, shadows } from '../../../theme/designSystem';
import type { UserRole } from '../../../types/domain';
import { useAuth } from '../../../core/providers/AuthProvider';

const roleOptions: Array<{ label: string; value: UserRole; icon: React.ReactNode }> = [
  { label: 'Jugador', value: 'player', icon: <Users size={16} color={colors.textSecondary} /> },
  { label: 'Club', value: 'club', icon: <Trophy size={16} color={colors.textSecondary} /> },
  { label: 'Admin', value: 'admin', icon: <Shield size={16} color={colors.textSecondary} /> },
];

export function AuthScreen() {
  const { isConfigured, signInWithPassword } = useAuth();
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
          {/* â”€â”€ Hero Section â”€â”€ */}
          <View style={styles.hero}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>⚽</Text>
            </View>
            <Text style={styles.brandName}>{businessRules.appName}</Text>
            <Text style={styles.tagline}>Canchas, pagos y partidos{'\n'}en Córdoba.</Text>
            <View style={styles.accentLine} />
          </View>

          {/* â”€â”€ Form Card â”€â”€ */}
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
                autofillMode="email"
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
                autofillMode="password"
                onChangeText={setPassword}
                placeholder="Contrasena"
                secureTextEntry
                showPasswordToggle
                value={password}
                variant="glass"
                label="Contrasena"
              />
            </View>

            {/* Primary CTA */}
            <Button
              disabled={isSubmitting || !isConfigured}
              icon={<LogIn size={18} color="#FFFFFF" />}
              label="Iniciar sesion"
              onPress={handlePasswordSignIn}
              variant="glow"
              size="lg"
              fullWidth
              loading={isSubmitting}
            />

            <Button
              disabled={isSubmitting}
              icon={<UserPlus size={18} color={colors.primary} />}
              label="Crear cuenta"
              onPress={() => setShowSignUp(true)}
              style={styles.signUpButton}
              variant="secondary"
              size="md"
              fullWidth
            />

            {!isConfigured && (
              <Text style={styles.configWarning}>
                Falta configurar Supabase en .env.local para iniciar sesion.
              </Text>
            )}
          </View>

          {/* â”€â”€ Footer â”€â”€ */}
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

  // â”€â”€ Hero â”€â”€
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

  // â”€â”€ Form â”€â”€
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

  signUpButton: {
    marginTop: 12,
  },

  configWarning: {
    marginTop: 12,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Footer
  footer: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

