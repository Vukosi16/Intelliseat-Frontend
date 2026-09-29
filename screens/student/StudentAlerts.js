import { View, Text, StyleSheet } from 'react-native';

export default function StudentAlerts() {
  return (
    <View style={styles.container}>
      <Text>Student Alerts Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});