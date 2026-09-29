import { View, Text, StyleSheet } from 'react-native';

export default function StudentQRCode() {
  return (
    <View style={styles.container}>
      <Text>Student QR Code Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});