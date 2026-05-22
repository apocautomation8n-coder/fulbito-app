import { useState, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { ArrowLeft, Calendar, User } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { H2, Body, Caption } from '../../../components/ui/Typography';
import { ClubRegistrationScreen } from '../../club/screens/ClubRegistrationScreen';
import { businessRules } from '../../../config/businessRules';
import { colors, spacing } from '../../../theme/designSystem';
import type { UserRole } from '../../../types/domain';
import { useAuth } from '../../../core/providers/AuthProvider';

const AnimatedView = Animated.createAnimatedComponent(View);

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

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withSequence(
      withDelay(0, withSpring(1, { damping: 15, stiffness: 400 })),
    );
    translateY.value = withSequence(
      withDelay(0, withSpring(0, { damping: 15, stiffness: 400 })),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

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
      <AnimatedView style={[styles.content, animatedStyle]}>
        <View style={styles.header}>
          <Button icon={<ArrowLeft size={20} />} label="" onPress={onBack} variant="ghost" size="sm" />
          <H2>Crear cuenta</H2>
          <View style={{ width: 40 }} />
        </View>

        <Card variant="glass" size="lg" style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Input
              autoCapitalize="words"
              onChangeText={setFullName}
              placeholder="Nombre completo"
              value={fullName}
              variant="glass"
              leftIcon={<User size={20} color={colors.textSecondary} />}
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Email"
              value={email}
              variant="glass"
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              onChangeText={setPassword}
              placeholder="Contraseña (mínimo 6 caracteres)"
              secureTextEntry
              value={password}
              variant="glass"
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              onChangeText={setConfirmPassword}
              placeholder="Confirmar contraseña"
              secureTextEntry
              value={confirmPassword}
              variant="glass"
            />
          </View>

          {defaultRole === 'player' && (
            <View style={styles.inputGroup}>
              <Input
                keyboardType="numbers-and-punctuation"
                onChangeText={setBirthdate}
                placeholder="Fecha de nacimiento (DD/MM/YYYY)"
                value={birthdate}
                variant="glass"
                leftIcon={<Calendar size={20} color={colors.textSecondary} />}
              />
              <Caption style={styles.hint}>Debes ser mayor de {businessRules.minimumAge} años</Caption>
            </View>
          )}

          <Button
            disabled={isSubmitting}
            label={isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            onPress={handleSignUp}
            variant="glow"
            size="lg"
            fullWidth
            loading={isSubmitting}
          />

          <Caption style={styles.terms}>
            Al registrarte aceptas los términos y condiciones de {businessRules.appName}.
          </Caption>
        </Card>
      </AnimatedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  formCard: {
    padding: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  hint: {
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  terms: {
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
