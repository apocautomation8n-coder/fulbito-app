import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Apple, LogIn, Mail, UserPlus, Trophy, Users, Shield } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Chip } from '../../../components/ui/Chip';
import { H1, H2, Body, Caption } from '../../../components/ui/Typography';
import { SignUpScreen } from './SignUpScreen';
import { businessRules } from '../../../config/businessRules';
import { company } from '../../../config/company';
import { colors, spacing, borderRadius } from '../../../theme/designSystem';
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
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <View style={styles.hero}>
        <H1 style={styles.brand}>{businessRules.appName}</H1>
        <Body style={styles.tagline}>Canchas, pagos y partidos en Córdoba.</Body>
        <View style={styles.accentLine} />
      </View>

      <View style={styles.formContainer}>
        <Card variant="glass" size="lg" style={styles.formCard}>
          <View style={styles.roleSelector}>
            {roleOptions.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                icon={option.icon}
                selected={role === option.value}
                onSelect={() => setRole(option.value)}
                variant={role === option.value ? 'primary' : 'outline'}
                size="md"
              />
            ))}
          </View>

          <View style={styles.inputs}>
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Email"
              value={email}
              variant="glass"
            />
            <Input
              onChangeText={setPassword}
              placeholder="Contraseña"
              secureTextEntry
              value={password}
              variant="glass"
            />
          </View>

          <Button
            disabled={isSubmitting}
            icon={<LogIn size={18} />}
            label={isConfigured ? 'Entrar' : 'Entrar demo'}
            onPress={handlePasswordSignIn}
            variant="glow"
            size="lg"
            fullWidth
          />

          <View style={styles.oauthRow}>
            <Button
              disabled={isSubmitting}
              icon={<Mail size={18} />}
              label="Google"
              onPress={() => handleOAuth('google')}
              style={styles.oauthButton}
              variant="secondary"
              size="md"
            />
            <Button
              disabled={isSubmitting}
              icon={<Apple size={18} />}
              label="Apple"
              onPress={() => handleOAuth('apple')}
              style={styles.oauthButton}
              variant="secondary"
              size="md"
            />
          </View>

          {isConfigured && (
            <Button
              icon={<UserPlus size={18} />}
              label="Crear cuenta"
              onPress={() => setShowSignUp(true)}
              variant="ghost"
              size="md"
              fullWidth
            />
          )}

          {!isConfigured && (
            <View style={styles.demoRow}>
              <Button label="Jugador" onPress={() => signInDemo('player')} variant="ghost" size="sm" />
              <Button label="Club" onPress={() => signInDemo('club')} variant="ghost" size="sm" />
              <Button label="Admin" onPress={() => signInDemo('admin')} variant="ghost" size="sm" />
            </View>
          )}
        </Card>
      </View>

      <Caption style={styles.terms}>18+ · Pago online · Clubes verificados · {company.legalName}</Caption>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  hero: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  brand: {
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  tagline: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  accentLine: {
    width: 60,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: spacing.md,
  },
  formContainer: {
    marginBottom: spacing.xl,
  },
  formCard: {
    padding: spacing.xl,
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  inputs: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  oauthRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  oauthButton: {
    flex: 1,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  terms: {
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
