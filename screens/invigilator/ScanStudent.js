// Scan a student. Camera and QR code.
import { View, Text, StyleSheet } from 'react-native';

export default function ScanStudent() {
  return (
    <View style={styles.container}>
      <Text>Scan Student Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});