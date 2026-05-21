import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Apple, LogIn, Mail, UserPlus } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { SignUpScreen } from './SignUpScreen';
import { businessRules } from '../../../config/businessRules';
import { company } from '../../../config/company';
import { colors, spacing, typography } from '../../../theme/theme';
import type { UserRole } from '../../../types/domain';
import { useAuth } from '../../../core/providers/AuthProvider';

const roleOptions: Array<{ label: string; value: UserRole }> = [
  { label: 'Jugador', value: 'player' },
  { label: 'Club', value: 'club' },
  { label: 'Admin', value: 'admin' },
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
        <Text style={styles.brand}>{businessRules.appName}</Text>
        <Text style={styles.tagline}>Canchas, pagos y partidos en Cordoba.</Text>
      </View>

      <Card style={styles.form}>
        <SegmentedControl value={role} options={roleOptions} onChange={setRole} />

        <View style={styles.inputs}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={email}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="Contrasena"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>

        <Button
          disabled={isSubmitting}
          icon={<LogIn color={colors.surface} size={18} />}
          label={isConfigured ? 'Entrar' : 'Entrar demo'}
          onPress={handlePasswordSignIn}
        />

        <View style={styles.oauthRow}>
          <Button
            disabled={isSubmitting}
            icon={<Mail color={colors.ink} size={18} />}
            label="Google"
            onPress={() => handleOAuth('google')}
            style={styles.oauthButton}
            variant="secondary"
          />
          <Button
            disabled={isSubmitting}
            icon={<Apple color={colors.ink} size={18} />}
            label="Apple"
            onPress={() => handleOAuth('apple')}
            style={styles.oauthButton}
            variant="secondary"
          />
        </View>

        {isConfigured && (
          <Button
            icon={<UserPlus color={colors.ink} size={18} />}
            label="Crear cuenta"
            onPress={() => setShowSignUp(true)}
            variant="ghost"
          />
        )}

        {!isConfigured ? (
          <View style={styles.demoRow}>
            <Button label="Jugador" onPress={() => signInDemo('player')} variant="ghost" />
            <Button label="Club" onPress={() => signInDemo('club')} variant="ghost" />
            <Button label="Admin" onPress={() => signInDemo('admin')} variant="ghost" />
          </View>
        ) : null}
      </Card>

      <Text style={styles.terms}>18+ · Pago online · Clubes verificados · {company.legalName}</Text>
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
  },
  brand: {
    color: colors.ink,
    fontSize: typography.title,
    fontWeight: '900',
  },
  tagline: {
    color: colors.muted,
    fontSize: typography.body,
    marginTop: spacing.sm,
  },
  form: {
    gap: spacing.lg,
  },
  inputs: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: typography.body,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  oauthRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  oauthButton: {
    flex: 1,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  terms: {
    color: colors.muted,
    fontSize: typography.small,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
