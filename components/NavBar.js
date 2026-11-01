import { useCallback, useState } from 'react';
import { DeviceEventEmitter, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { request, unwrapList } from '../api';
import IntelliSeatIcon from '../assets/intelliseat_armchair_icon.svg';

// The student pages use the defaults. Invigilator pages pass their own screen names.
export default function NavBar({ alertsScreen = 'StudentAlert', profileScreen = 'StudentProfile' }) {
  const navigation = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const loadUnreadCount = async () => {
        try {
          const result = await request('/api/alerts');
          const list = unwrapList(result, 'alerts');
          if (active) setUnreadCount(list.filter((alert) => !alert.read).length);
        } catch (error) {
          console.warn('Could not load unread alert count:', error);
        }
      };

      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      const readListener = DeviceEventEmitter.addListener('intelliseat:alerts-updated', loadUnreadCount);
      return () => {
        active = false;
        clearInterval(interval);
        readListener.remove();
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoSurface}>
          <IntelliSeatIcon width={36} height={41} />
        </View>
      </View>

      <View style={styles.leftContainer}>
        <TouchableOpacity
          accessibilityLabel={unreadCount ? `Alerts, ${unreadCount} unread` : 'Alerts'}
          onPress={() => navigation.navigate(alertsScreen)}
          style={styles.notificationButton}
        >
          <Ionicons name="notifications-outline" size={35} color="gold" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate(profileScreen)}>
          <Ionicons name="person-circle-outline" size={40} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 70,
    backgroundColor: '#0B1E4A',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#122B63',
  },
  logoContainer: {
    marginLeft: 18,
  },
  logoSurface: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#F5F7FB',
  },
  leftContainer: {
    flexDirection: 'row',
    gap: 15,
    paddingRight: 20,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -3,
    right: -5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#D2232A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
});