import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { ArrowLeft, Calendar, User } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ClubRegistrationScreen } from '../../club/screens/ClubRegistrationScreen';
import { businessRules } from '../../../config/businessRules';
import { colors, spacing, typography } from '../../../theme/theme';
import type { UserRole } from '../../../types/domain';
import { useAuth } from '../../../core/providers/AuthProvider';

interface SignUpScreenProps {
  onBack: () => void;
  defaultRole?: UserRole;
}

export function SignUpScreen({ onBack, defaultRole = 'player' }: SignUpScreenProps) {
  const { signUp, isConfigured, user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClubRegistration, setShowClubRegistration] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresa tu nombre completo.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Email requerido', 'Por favor ingresa tu email.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Contraseña requerida', 'Por favor ingresa una contraseña.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Contraseñas no coinciden', 'Las contraseñas deben ser iguales.');
      return;
    }

    if (defaultRole === 'player' && !birthdate.trim()) {
      Alert.alert('Fecha de nacimiento requerida', 'Por favor ingresa tu fecha de nacimiento.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp(email, password, fullName, defaultRole, birthdate || undefined);
      
      if (defaultRole === 'club') {
        // For club users, show club registration screen
        setNewUserId(result.userId);
        setShowClubRegistration(true);
      } else {
        Alert.alert(
          'Registro exitoso',
          isConfigured
            ? 'Tu cuenta ha sido creada. Por favor verifica tu email.'
            : 'Modo demo: Cuenta creada exitosamente.',
        );
        onBack();
      }
    } catch (error) {
      Alert.alert('Error en el registro', error instanceof Error ? error.message : 'Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClubRegistrationComplete = (clubId: string) => {
    Alert.alert('Club registrado', 'Tu club ha sido creado exitosamente.');
    onBack();
  };

  if (showClubRegistration && newUserId) {
    return (
      <ClubRegistrationScreen
        ownerId={newUserId}
        onComplete={handleClubRegistrationComplete}
        onCancel={onBack}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <View style={styles.header}>
        <Button icon={<ArrowLeft color={colors.ink} size={20} />} label="" onPress={onBack} variant="ghost" />
        <Text style={styles.title}>Crear cuenta</Text>
        <View style={{ width: 40 }} />
      </View>

      <Card style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre completo</Text>
          <View style={styles.inputWrapper}>
            <User color={colors.muted} size={20} style={styles.inputIcon} />
            <TextInput
              autoCapitalize="words"
              onChangeText={setFullName}
              placeholder="Juan Pérez"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={fullName}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="juan@ejemplo.com"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={email}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
            value={password}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            onChangeText={setConfirmPassword}
            placeholder="Repite tu contraseña"
            placeholderTextColor={colors.muted}
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
          />
        </View>

        {defaultRole === 'player' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de nacimiento</Text>
            <View style={styles.inputWrapper}>
              <Calendar color={colors.muted} size={20} style={styles.inputIcon} />
              <TextInput
                keyboardType="numbers-and-punctuation"
                onChangeText={setBirthdate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={birthdate}
              />
            </View>
            <Text style={styles.hint}>Debes ser mayor de {businessRules.minimumAge} años</Text>
          </View>
        )}

        <Button
          disabled={isSubmitting}
          label={isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          onPress={handleSignUp}
        />

        <Text style={styles.terms}>
          Al registrarte aceptas los términos y condiciones de {businessRules.appName}.
        </Text>
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '600',
  },
  inputWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  inputIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: typography.body,
    minHeight: 48,
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
    width: '100%',
  },
  hint: {
    color: colors.muted,
    fontSize: typography.small,
  },
  terms: {
    color: colors.muted,
    fontSize: typography.small,
    textAlign: 'center',
  },
});
