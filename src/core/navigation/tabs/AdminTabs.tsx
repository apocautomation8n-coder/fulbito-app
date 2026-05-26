import { CreditCard, LogOut, Shield, Users } from 'lucide-react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AdminAccountScreen } from '../../../features/admin/screens/AdminAccountScreen';
import { AdminClubsScreen } from '../../../features/admin/screens/AdminClubsScreen';
import { AdminPaymentsScreen } from '../../../features/admin/screens/AdminPaymentsScreen';
import { AdminUsersScreen } from '../../../features/admin/screens/AdminUsersScreen';
import { colors } from '../../../theme/theme';

export type AdminTabParamList = {
  Clubs: undefined;
  Users: undefined;
  Payments: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

export function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="Clubs"
        component={AdminClubsScreen}
        options={{
          title: 'Clubes',
          tabBarIcon: ({ color, size }) => <Shield color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Users"
        component={AdminUsersScreen}
        options={{
          title: 'Usuarios',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Payments"
        component={AdminPaymentsScreen}
        options={{
          title: 'Pagos',
          tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AdminAccountScreen}
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color, size }) => <LogOut color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
