import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthScreen } from '../../features/auth/screens/AuthScreen';
import { AdminTabs } from './tabs/AdminTabs';
import { ClubTabs } from './tabs/ClubTabs';
import { PlayerTabs } from './tabs/PlayerTabs';
import { useAuth } from '../providers/AuthProvider';
import { colors } from '../../theme/theme';

export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (user.role === 'admin') {
    return <AdminTabs />;
  }

  if (user.role === 'club') {
    return <ClubTabs />;
  }

  return <PlayerTabs />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
