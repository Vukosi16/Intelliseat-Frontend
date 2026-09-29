import { View, Text, StyleSheet } from 'react-native';

export default function NextExam() {
  return (
    <View style={styles.container}>
      <Text>Next Exam Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});