import { View, Text, StyleSheet } from 'react-native';

export default function FullLabMap() {
  return (
    <View style={styles.container}>
      <Text>Full Lab Map Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});