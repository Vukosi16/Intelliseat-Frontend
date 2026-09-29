import { View, Text, StyleSheet } from 'react-native';

export default function InvigilatorDashboard() {
  return (
    <View style={styles.container}>
      <Text>Invigilator Dashboard Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});