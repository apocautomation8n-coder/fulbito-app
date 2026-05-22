import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Calendar, User, Mail, Lock, CheckCircle } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ClubRegistrationScreen } from '../../club/screens/ClubRegistrationScreen';
import { businessRules } from '../../../config/businessRules';
import { colors, spacing, shadows } from '../../../theme/designSystem';
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

  const roleLabel = defaultRole === 'player' ? 'Jugador' : defaultRole === 'club' ? 'Club' : 'Admin';

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
        >
          <AnimatedView style={animatedStyle}>
            {/* ── Header ── */}
            <View style={styles.header}>
              <Button
                icon={<ArrowLeft size={20} color={colors.textPrimary} />}
                label=""
                onPress={onBack}
                variant="ghost"
                size="sm"
              />
              <Text style={styles.headerTitle}>Crear cuenta</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* ── Role Badge ── */}
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Registrando como {roleLabel}</Text>
            </View>

            {/* ── Form Card ── */}
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Input
                  autoCapitalize="words"
                  onChangeText={setFullName}
                  placeholder="Nombre completo"
                  value={fullName}
                  variant="glass"
                  label="Nombre completo"
                  leftIcon={<User size={18} color={colors.textTertiary} />}
                />
              </View>

              <View style={styles.inputGroup}>
                <Input
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="tu@email.com"
                  value={email}
                  variant="glass"
                  label="Email"
                  leftIcon={<Mail size={18} color={colors.textTertiary} />}
                />
              </View>

              <View style={styles.inputGroup}>
                <Input
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry
                  value={password}
                  variant="glass"
                  label="Contraseña"
                  leftIcon={<Lock size={18} color={colors.textTertiary} />}
                />
              </View>

              <View style={styles.inputGroup}>
                <Input
                  onChangeText={setConfirmPassword}
                  placeholder="Repetir contraseña"
                  secureTextEntry
                  value={confirmPassword}
                  variant="glass"
                  label="Confirmar contraseña"
                  leftIcon={<CheckCircle size={18} color={colors.textTertiary} />}
                />
              </View>

              {defaultRole === 'player' && (
                <View style={styles.inputGroup}>
                  <Input
                    keyboardType="numbers-and-punctuation"
                    onChangeText={setBirthdate}
                    placeholder="DD/MM/YYYY"
                    value={birthdate}
                    variant="glass"
                    label="Fecha de nacimiento"
                    leftIcon={<Calendar size={18} color={colors.textTertiary} />}
                  />
                  <Text style={styles.hint}>
                    Debes ser mayor de {businessRules.minimumAge} años
                  </Text>
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
            </View>

            {/* ── Terms ── */}
            <Text style={styles.terms}>
              Al registrarte aceptas los términos y condiciones de {businessRules.appName}.
            </Text>
          </AnimatedView>
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
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  // ── Header ──
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // ── Role Badge ──
  roleBadge: {
    alignSelf: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },

  // ── Form ──
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  hint: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textTertiary,
    marginTop: 6,
    paddingLeft: 4,
  },

  // ── Footer ──
  terms: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});
