import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestPushToken() {
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Fulbito',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}
