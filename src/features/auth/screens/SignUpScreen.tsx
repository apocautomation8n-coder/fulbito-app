import React, { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ArrowLeft, Calendar, User, Mail, Lock, CheckCircle, Phone } from 'lucide-react-native';
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
  const { signUp, isConfigured } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showBirthdatePicker, setShowBirthdatePicker] = useState(false);
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

  const maxBirthdate = new Date();
  maxBirthdate.setFullYear(maxBirthdate.getFullYear() - businessRules.minimumAge);

  const formatBirthdateForDisplay = (date: Date) =>
    date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const formatBirthdateForSubmit = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleBirthdateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowBirthdatePicker(false);
    }

    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

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

    if (defaultRole === 'player' && !birthdate) {
      Alert.alert('Fecha de nacimiento requerida', 'Por favor ingresa tu fecha de nacimiento.');
      return;
    }

    const normalizedPhone = phone.replace(/\s+/g, '');
    if (defaultRole === 'player' && normalizedPhone.length < 8) {
      Alert.alert('Celular requerido', 'Ingresa tu numero de celular con codigo de area.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signUp(
        email,
        password,
        fullName,
        defaultRole,
        birthdate ? formatBirthdateForSubmit(birthdate) : undefined,
        defaultRole === 'player' ? normalizedPhone : undefined,
      );
      
      if (defaultRole === 'club') {
        if (!result.userId || result.needsEmailConfirmation) {
          Alert.alert(
            'Confirma tu email',
            'Te enviamos un correo de confirmacion. Abri el link y despues inicia sesion para completar el registro del club.',
          );
          onBack();
          return;
        }

        setNewUserId(result.userId);
        setShowClubRegistration(true);
        return;
      }

      Alert.alert(
        'Registro exitoso',
        result.needsEmailConfirmation
          ? 'Te enviamos un correo de confirmacion. Abri el link y despues inicia sesion.'
          : 'Tu cuenta ya esta lista. Ya podes iniciar sesion.',
      );
      onBack();
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
            {/* â”€â”€ Header â”€â”€ */}
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

            {/* â”€â”€ Role Badge â”€â”€ */}
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Registrando como {roleLabel}</Text>
            </View>

            {/* â”€â”€ Form Card â”€â”€ */}
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Input
                  autofillMode="name"
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
                  autofillMode="email"
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

              {defaultRole === 'player' && (
                <View style={styles.inputGroup}>
                  <Input
                    autofillMode="tel"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="phone-pad"
                    onChangeText={setPhone}
                    placeholder="Ej: 3516889921"
                    value={phone}
                    variant="glass"
                    label="Numero de celular"
                    leftIcon={<Phone size={18} color={colors.textTertiary} />}
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Input
                  autofillMode="newPassword"
                  onChangeText={setPassword}
                  placeholder="Minimo 6 caracteres"
                  secureTextEntry
                  showPasswordToggle
                  value={password}
                  variant="glass"
                  label="Contrasena"
                  leftIcon={<Lock size={18} color={colors.textTertiary} />}
                />
              </View>

              <View style={styles.inputGroup}>
                <Input
                  autofillMode="newPassword"
                  onChangeText={setConfirmPassword}
                  placeholder="Repetir contrasena"
                  secureTextEntry
                  showPasswordToggle
                  value={confirmPassword}
                  variant="glass"
                  label="Confirmar contrasena"
                  leftIcon={<CheckCircle size={18} color={colors.textTertiary} />}
                />
              </View>

              {defaultRole === 'player' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Fecha de nacimiento</Text>
                  <Pressable onPress={() => setShowBirthdatePicker(true)} style={styles.dateField}>
                    <Calendar size={18} color={colors.textTertiary} />
                    <Text style={[styles.dateFieldText, !birthdate && styles.datePlaceholder]}>
                      {birthdate ? formatBirthdateForDisplay(birthdate) : 'Seleccionar fecha'}
                    </Text>
                  </Pressable>
                  {showBirthdatePicker && (
                    <View style={styles.pickerContainer}>
                      <DateTimePicker
                        value={birthdate ?? maxBirthdate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        maximumDate={maxBirthdate}
                        onChange={handleBirthdateChange}
                        locale="es-AR"
                        themeVariant="light"
                      />
                      {Platform.OS === 'ios' && (
                        <Button
                          label="Confirmar fecha"
                          onPress={() => setShowBirthdatePicker(false)}
                          variant="primary"
                          size="sm"
                          fullWidth
                        />
                      )}
                    </View>
                  )}
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

            {/* â”€â”€ Terms â”€â”€ */}
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

  // â”€â”€ Header â”€â”€
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

  // â”€â”€ Role Badge â”€â”€
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

  // â”€â”€ Form â”€â”€
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
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dateField: {
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  dateFieldText: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
    marginLeft: spacing.sm,
  },
  datePlaceholder: {
    color: colors.textTertiary,
  },
  pickerContainer: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  hint: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textTertiary,
    marginTop: 6,
    paddingLeft: 4,
  },

  // â”€â”€ Footer â”€â”€
  terms: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});

