import { Calendar, CreditCard, Home, MapPin, ShoppingCart } from 'lucide-react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { ClubAgendaScreen } from '../../../features/club/screens/ClubAgendaScreen';
import { ClubCourtsScreen } from '../../../features/club/screens/ClubCourtsScreen';
import { ClubKioskScreen } from '../../../features/club/screens/ClubKioskScreen';
import { ClubPaymentsScreen } from '../../../features/club/screens/ClubPaymentsScreen';
import { ClubProfileScreen } from '../../../features/club/screens/ClubProfileScreen';
import { colors } from '../../../theme/theme';

export type ClubTabParamList = {
  Agenda: undefined;
  Courts: undefined;
  Kiosk: undefined;
  Payments: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ClubTabParamList>();

export function ClubTabs() {
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
        name="Agenda"
        component={ClubAgendaScreen}
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Courts"
        component={ClubCourtsScreen}
        options={{
          title: 'Canchas',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Kiosk"
        component={ClubKioskScreen}
        options={{
          title: 'Kiosco',
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Payments"
        component={ClubPaymentsScreen}
        options={{
          title: 'Caja',
          tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ClubProfileScreen}
        options={{
          title: 'Club',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
