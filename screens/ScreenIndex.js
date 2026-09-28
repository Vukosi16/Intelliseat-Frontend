import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { screens } from './registry';

export default function ScreenIndex({ navigation }) {
  const groups = [...new Set(screens.map((s) => s.group))];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {groups.map((group) => (
        <React.Fragment key={group}>
          <Text style={styles.group}>{group}</Text>
          {screens.filter((s) => s.group === group).map((s) => (
            <TouchableOpacity
              key={s.name}
              style={styles.button}
              onPress={() => navigation.navigate(s.name)}
            >
              <Text style={styles.buttonText}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </React.Fragment>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 30 },
  group: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginTop: 20, marginBottom: 8 },
  button: { backgroundColor: '#122B63', padding: 14, borderRadius: 10, marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});