import { StyleSheet, Text, View } from 'react-native';
import { useNetworkState } from 'expo-network';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NetworkStatusBanner() {
  const { isConnected, isInternetReachable } = useNetworkState();
  const insets = useSafeAreaInsets();
  const offline = isConnected === false || isInternetReachable === false;

  if (!offline) return null;

  return (
    <View
      pointerEvents="none"
      accessibilityRole="alert"
      style={[styles.banner, { top: Math.max(insets.top, 8) }]}
    >
      <Text style={styles.message}>
        No internet connection. Online features are unavailable until you reconnect.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 1000,
    elevation: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E4A33B',
    borderRadius: 6,
    backgroundColor: '#FFF4DF',
  },
  message: {
    color: '#573A12',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});