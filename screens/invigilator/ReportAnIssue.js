// From the Student profile.
import { View, Text, StyleSheet } from 'react-native';

export default function ReportAnIssue() {
  return (
    <View style={styles.container}>
      <Text>Report An Issue Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});