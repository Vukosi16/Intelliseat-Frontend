import { View, Text, StyleSheet } from 'react-native';

export default function ViewSessions() {
  return (
    <View style={styles.container}>
      <Text>View Sessions Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});