import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Minus, Plus, ShieldCheck, ShoppingCart, Trash2 } from 'lucide-react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Screen } from '../../../components/ui/Screen';
import { StatPill } from '../../../components/ui/StatPill';
import { formatCurrency } from '../../../config/businessRules';
import { colors, spacing, typography } from '../../../theme/theme';

type KioskProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
};

const products: KioskProduct[] = [];

export function ClubKioskScreen() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');

  const cartItems = useMemo(
    () =>
      products
        .map((product) => ({
          ...product,
          quantity: cart[product.id] ?? 0,
        }))
        .filter((product) => product.quantity > 0),
    [cart],
  );

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const units = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addProduct = (productId: string) => {
    setCart((current) => ({
      ...current,
      [productId]: (current[productId] ?? 0) + 1,
    }));
  };

  const removeProduct = (productId: string) => {
    setCart((current) => {
      const quantity = (current[productId] ?? 0) - 1;
      if (quantity <= 0) {
        const next = { ...current };
        delete next[productId];
        return next;
      }
      return { ...current, [productId]: quantity };
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const closeSale = () => {
    if (total <= 0) {
      Alert.alert('Carrito vacio', 'Agrega productos antes de cerrar la venta.');
      return;
    }

    Alert.alert(
      'Venta registrada',
      `Total: ${formatCurrency(total)}\nMetodo: ${paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia'}\n\nEn produccion esto impacta stock y caja diaria del club.`,
    );
    clearCart();
  };

  return (
    <Screen title="Kiosco" subtitle="Venta rapida para bebidas, alquileres y productos del club.">
      <View style={styles.stats}>
        <StatPill label="Items" value={units.toString()} />
        <StatPill label="Total" value={formatCurrency(total)} />
        <StatPill label="Productos" value={products.length.toString()} />
      </View>

      <Card style={styles.noticeCard}>
        <ShieldCheck color={colors.primary} size={20} />
        <View style={styles.noticeText}>
          <Text style={styles.noticeTitle}>Sin comision Fulbito</Text>
          <Text style={styles.noticeSubtitle}>
            Las ventas del kiosco son 100% del club. Fulbito solo ayuda a registrar caja y stock.
          </Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Productos</Text>
        <View style={styles.productGrid}>
          {products.map((product) => {
            const quantity = cart[product.id] ?? 0;
            return (
              <Pressable key={product.id} style={styles.productTile} onPress={() => addProduct(product.id)}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
                <View style={styles.productFooter}>
                  <Text style={styles.stockText}>Stock {product.stock}</Text>
                  {quantity > 0 && <Text style={styles.quantityBadge}>x{quantity}</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.cartHeader}>
          <View style={styles.cartTitleRow}>
            <ShoppingCart color={colors.primary} size={20} />
            <Text style={styles.sectionTitle}>Carrito</Text>
          </View>
          <Pressable onPress={clearCart} style={styles.clearButton}>
            <Trash2 color={colors.danger} size={16} />
          </Pressable>
        </View>

        {cartItems.length === 0 ? (
          <Text style={styles.emptyText}>Todavia no hay productos cargados.</Text>
        ) : (
          <View style={styles.cartList}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartRow}>
                <View style={styles.cartItemText}>
                  <Text style={styles.cartName}>{item.name}</Text>
                  <Text style={styles.cartMeta}>{formatCurrency(item.price)} c/u</Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable style={styles.stepButton} onPress={() => removeProduct(item.id)}>
                    <Minus color={colors.ink} size={16} />
                  </Pressable>
                  <Text style={styles.stepValue}>{item.quantity}</Text>
                  <Pressable style={styles.stepButton} onPress={() => addProduct(item.id)}>
                    <Plus color={colors.ink} size={16} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.paymentRow}>
          <Pressable
            onPress={() => setPaymentMethod('cash')}
            style={[styles.paymentChip, paymentMethod === 'cash' && styles.paymentChipSelected]}
          >
            <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.paymentTextSelected]}>Efectivo</Text>
          </Pressable>
          <Pressable
            onPress={() => setPaymentMethod('transfer')}
            style={[styles.paymentChip, paymentMethod === 'transfer' && styles.paymentChipSelected]}
          >
            <Text style={[styles.paymentText, paymentMethod === 'transfer' && styles.paymentTextSelected]}>
              Transferencia
            </Text>
          </Pressable>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total venta</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>

        <Button label="Cerrar venta" onPress={closeSale} fullWidth />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
  noticeCard: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  noticeText: {
    flex: 1,
  },
  noticeTitle: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '800',
  },
  noticeSubtitle: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '800',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  productTile: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 118,
    padding: spacing.md,
    width: '48%',
  },
  productName: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '800',
  },
  productCategory: {
    color: colors.muted,
    fontSize: typography.tiny,
    fontWeight: '700',
  },
  productPrice: {
    color: colors.primaryDark,
    fontSize: typography.body,
    fontWeight: '800',
  },
  productFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  stockText: {
    color: colors.muted,
    fontSize: typography.tiny,
    fontWeight: '700',
  },
  quantityBadge: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    color: colors.surface,
    fontSize: typography.tiny,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  cartHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cartTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  emptyText: {
    color: colors.muted,
    fontSize: typography.small,
  },
  cartList: {
    gap: spacing.sm,
  },
  cartRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  cartItemText: {
    flex: 1,
  },
  cartName: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '800',
  },
  cartMeta: {
    color: colors.muted,
    fontSize: typography.small,
    marginTop: 2,
  },
  stepper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  stepValue: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  paymentChip: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  paymentChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paymentText: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '800',
  },
  paymentTextSelected: {
    color: colors.surface,
  },
  totalRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  totalLabel: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '800',
  },
  totalValue: {
    color: colors.ink,
    fontSize: typography.h2,
    fontWeight: '800',
  },
});
