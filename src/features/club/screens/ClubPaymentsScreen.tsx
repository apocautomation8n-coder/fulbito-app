import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  CalendarClock,
  DollarSign,
  Link,
  MinusCircle,
  Plus,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { bookingsRepository } from '../../../data/repositories/bookings.repository';
import { businessRules, calculateBookingAmounts, formatCurrency } from '../../../config/businessRules';
import { colors, spacing, typography } from '../../../theme/theme';

const demoPaidBookings = [28000, 22000, 30000].map((turnPrice, index) => {
  const amounts = calculateBookingAmounts(turnPrice);

  return {
    id: `demo-paid-${index}`,
    total_amount: amounts.totalAmount,
    amount_due_now: amounts.amountDueNow,
    app_commission: amounts.appCommission,
  };
});

const demoKioskSales = [7200, 5400, 11800, 3600];

const demoExpenses = [
  { id: 'expense-1', label: 'Reposicion bebidas', amount: 18000 },
  { id: 'expense-2', label: 'Limpieza vestuarios', amount: 9000 },
];

const getMonthlyBillingWindow = () => {
  const now = new Date();
  const generatedAt = new Date(
    now.getFullYear(),
    now.getMonth(),
    businessRules.clubBillingGenerationDay,
  );
  const dueAt = new Date(generatedAt);
  dueAt.setDate(generatedAt.getDate() + businessRules.clubBillingPaymentWindowDays - 1);

  return {
    generatedAtLabel: generatedAt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
    dueAtLabel: dueAt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
    isOverdue: now > dueAt,
  };
};

export function ClubPaymentsScreen() {
  const [generatedTurns, setGeneratedTurns] = useState(demoPaidBookings.length);
  const [generatedRevenue, setGeneratedRevenue] = useState(
    demoPaidBookings.reduce((sum, booking) => sum + booking.total_amount, 0),
  );
  const [pendingClubCommission, setPendingClubCommission] = useState(
    demoPaidBookings.reduce((sum, booking) => sum + booking.app_commission - booking.amount_due_now, 0),
  );
  const [kioskRevenue, setKioskRevenue] = useState(demoKioskSales.reduce((sum, sale) => sum + sale, 0));
  const [expenses, setExpenses] = useState(demoExpenses);
  const [expenseLabel, setExpenseLabel] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const billingWindow = getMonthlyBillingWindow();
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const grossIncome = generatedRevenue + kioskRevenue;
  const netIncome = grossIncome - totalExpenses - pendingClubCommission;

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      // TODO: Get actual club ID from auth context
      const clubBookings = await bookingsRepository.getClubBookings('demo-club');
      const paidBookings = clubBookings.filter((b) => b.status === 'paid');
      const sourceBookings = paidBookings.length > 0 ? paidBookings : demoPaidBookings;
      
      const generated = sourceBookings
        .reduce((sum, b) => sum + b.total_amount, 0);

      const pendingCommission = sourceBookings
        .reduce((sum, b) => sum + Math.max(b.app_commission - b.amount_due_now, 0), 0);

      setGeneratedTurns(sourceBookings.length);
      setGeneratedRevenue(generated);
      setPendingClubCommission(pendingCommission);
      setKioskRevenue(demoKioskSales.reduce((sum, sale) => sum + sale, 0));
    } catch (error) {
      Alert.alert('Error', 'No pudimos cargar los pagos.');
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = () => {
    const amount = Number(expenseAmount.replace(',', '.'));

    if (!expenseLabel.trim()) {
      Alert.alert('Detalle requerido', 'Ingresa el detalle del egreso.');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Monto invalido', 'Ingresa un monto mayor a cero.');
      return;
    }

    setExpenses((current) => [
      {
        id: `expense-${Date.now()}`,
        label: expenseLabel.trim(),
        amount,
      },
      ...current,
    ]);
    setExpenseLabel('');
    setExpenseAmount('');
  };

  const removeExpense = (expenseId: string) => {
    setExpenses((current) => current.filter((expense) => expense.id !== expenseId));
  };

  return (
    <Screen title="Caja" subtitle="Ingresos, egresos, turnos, kiosco y cierre mensual Fulbito.">
      <Button
        disabled={isLoading}
        label={isLoading ? 'Cargando...' : 'Actualizar'}
        onPress={loadPayments}
        variant="secondary"
      />

      <View style={styles.summaryGrid}>
        <Card style={styles.summaryCard}>
          <DollarSign color={colors.success} size={22} />
          <Text style={styles.summaryLabel}>Ingresos</Text>
          <Text style={styles.summaryValue}>{formatCurrency(grossIncome)}</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <MinusCircle color={colors.danger} size={22} />
          <Text style={styles.summaryLabel}>Egresos</Text>
          <Text style={[styles.summaryValue, styles.expenseAmount]}>{formatCurrency(totalExpenses)}</Text>
        </Card>
        <Card style={styles.summaryCardWide}>
          <TrendingUp color={netIncome >= 0 ? colors.success : colors.danger} size={22} />
          <View style={styles.textBlock}>
            <Text style={styles.summaryLabel}>Neto estimado</Text>
            <Text style={[styles.summaryValue, netIncome < 0 && styles.expenseAmount]}>{formatCurrency(netIncome)}</Text>
          </View>
        </Card>
      </View>

      <Card style={styles.card}>
        <View style={styles.row}>
          <TrendingUp color={colors.success} size={24} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>Turnos generados</Text>
            <Text style={styles.subtitle}>Reservas confirmadas desde Fulbito.</Text>
          </View>
        </View>
        <Text style={styles.amount}>{generatedTurns}</Text>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <DollarSign color={colors.success} size={24} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>Facturacion de turnos</Text>
            <Text style={styles.subtitle}>Monto que los jugadores pagan directamente en el club.</Text>
          </View>
        </View>
        <Text style={styles.amount}>{formatCurrency(generatedRevenue)}</Text>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <ShoppingCart color={colors.primary} size={24} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>Facturacion de kiosco</Text>
            <Text style={styles.subtitle}>Ventas registradas desde el modulo Kiosco.</Text>
          </View>
        </View>
        <Text style={styles.amount}>{formatCurrency(kioskRevenue)}</Text>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <ReceiptText color={colors.danger} size={24} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>Egresos del mes</Text>
            <Text style={styles.subtitle}>Gastos operativos del club para ver la caja real.</Text>
          </View>
        </View>

        <View style={styles.expenseForm}>
          <TextInput
            onChangeText={setExpenseLabel}
            placeholder="Ej: luz, sueldo, compra stock"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.expenseDetailInput]}
            value={expenseLabel}
          />
          <TextInput
            keyboardType="number-pad"
            onChangeText={setExpenseAmount}
            placeholder="Monto"
            placeholderTextColor={colors.muted}
            style={[styles.input, styles.expenseAmountInput]}
            value={expenseAmount}
          />
          <Pressable style={styles.addExpenseButton} onPress={addExpense}>
            <Plus color={colors.surface} size={18} />
          </Pressable>
        </View>

        <View style={styles.expenseList}>
          {expenses.map((expense) => (
            <View key={expense.id} style={styles.expenseRow}>
              <View style={styles.textBlock}>
                <Text style={styles.expenseLabel}>{expense.label}</Text>
                <Text style={styles.expenseMeta}>Egreso registrado</Text>
              </View>
              <Text style={styles.expenseValue}>-{formatCurrency(expense.amount)}</Text>
              <Pressable style={styles.removeExpenseButton} onPress={() => removeExpense(expense.id)}>
                <MinusCircle color={colors.danger} size={18} />
              </Pressable>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <CalendarClock color={colors.primary} size={24} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>Cierre Fulbito pendiente</Text>
            <Text style={styles.subtitle}>
              Comision del club por reservas generadas desde Fulbito.
            </Text>
          </View>
        </View>
        <Text style={[styles.amount, styles.pendingAmount]}>{formatCurrency(pendingClubCommission)}</Text>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <Link color={colors.primary} size={24} />
          <View style={styles.textBlock}>
            <Text style={styles.title}>Link automatico mensual</Text>
            <Text style={styles.subtitle}>
              Se genera el dia {businessRules.clubBillingGenerationDay} de cada mes y vence el {billingWindow.dueAtLabel}.
            </Text>
          </View>
        </View>
        <View style={styles.billingBox}>
          <Text style={styles.billingLabel}>Generado automaticamente</Text>
          <Text style={styles.billingValue}>{billingWindow.generatedAtLabel}</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    gap: spacing.sm,
    minWidth: '45%',
  },
  summaryCardWide: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '800',
  },
  summaryValue: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  card: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  amount: {
    color: colors.primaryDark,
    fontSize: typography.h1,
    fontWeight: '800',
  },
  pendingAmount: {
    color: colors.coral,
  },
  expenseAmount: {
    color: colors.danger,
  },
  expenseForm: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.ink,
    fontSize: typography.body,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  expenseDetailInput: {
    flex: 1,
  },
  expenseAmountInput: {
    width: 96,
  },
  addExpenseButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  expenseList: {
    gap: spacing.sm,
  },
  expenseRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  expenseLabel: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '800',
  },
  expenseMeta: {
    color: colors.muted,
    fontSize: typography.small,
    marginTop: 2,
  },
  expenseValue: {
    color: colors.danger,
    fontSize: typography.small,
    fontWeight: '800',
  },
  removeExpenseButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  billingBox: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  billingLabel: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '700',
  },
  billingValue: {
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: '800',
  },
});
