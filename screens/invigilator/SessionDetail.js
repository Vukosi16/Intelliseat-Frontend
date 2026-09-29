import { View, Text, StyleSheet } from 'react-native';

export default function SessionDetail() {
  return (
    <View style={styles.container}>
      <Text>Session Detail Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});