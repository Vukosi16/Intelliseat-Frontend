import { View, Text, StyleSheet } from 'react-native';

export default function StudentSupport() {
  return (
    <View style={styles.container}>
      <Text>Student Support Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});