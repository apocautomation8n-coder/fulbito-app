import { Calendar, MapPin, User, Users } from 'lucide-react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { PlayerBookingsScreen } from '../../../features/player/screens/PlayerBookingsScreen';
import { PlayerCourtsScreen } from '../../../features/player/screens/PlayerCourtsScreen';
import { PlayerMatchesScreen } from '../../../features/player/screens/PlayerMatchesScreen';
import { PlayerProfileScreen } from '../../../features/player/screens/PlayerProfileScreen';
import { colors } from '../../../theme/theme';

export type PlayerTabParamList = {
  Courts: undefined;
  Matches: undefined;
  Bookings: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<PlayerTabParamList>();

export function PlayerTabs() {
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
        name="Courts"
        component={PlayerCourtsScreen}
        options={{
          title: 'Canchas',
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Matches"
        component={PlayerMatchesScreen}
        options={{
          title: 'Partidos',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={PlayerBookingsScreen}
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={PlayerProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
