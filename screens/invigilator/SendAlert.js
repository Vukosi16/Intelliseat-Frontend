import { View, Text, StyleSheet } from 'react-native';

export default function SendAlert() {
  return (
    <View style={styles.container}>
      <Text>Send Alert Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});