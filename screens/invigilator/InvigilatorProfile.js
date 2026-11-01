import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';
import { useAuth } from '../../context/AuthContext';

export default function InvigilatorProfile() {
  const { user, logout, updateUser } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const firstName = user?.firstName || 'Invigilator';
  const lastName = user?.lastName || '';
  const initials = ((firstName[0] || 'I') + (lastName[0] || '')).toUpperCase();
  const staffNumber = user?.staffNumber || user?.employeeNumber || '—';
  const email = user?.email || '—';
  const role = user?.role || 'invigilator';

  const details = [
    { label: 'Staff number', value: staffNumber },
    { label: 'Email', value: email },
    { label: 'Role', value: role },
  ];

  async function saveProfile() {
    setSaving(true);
    setMessage('');
    try {
      await updateUser({ phone });
      setMessage('Profile updated.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <NavBar alertsScreen="InvigilatorAlerts" profileScreen="InvigilatorProfile" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>
            {firstName} {lastName}
          </Text>
        </View>

        <View style={styles.card}>
          {details.map((item, index) => (
            <View key={item.label} style={[styles.row, index === details.length - 1 && styles.lastRow]}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Contact number" placeholderTextColor="#9AA6C4" keyboardType="phone-pad" />
        {!!message && <Text style={styles.helpText}>{message}</Text>}
        <TouchableOpacity style={styles.saveButton} onPress={saveProfile} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save profile'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.buttonText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1E4A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2A52A8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 14,
  },
  card: {
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1B3C82',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  helpText: {
    fontSize: 13,
    color: '#9AA6C4',
    textAlign: 'center',
    marginTop: 12,
  },
  input: {
    backgroundColor: '#122B63',
    borderWidth: 1,
    borderColor: '#1B3C82',
    borderRadius: 8,
    color: 'white',
    padding: 14,
    marginTop: 14,
  },
  saveButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2A52A8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  rowLabel: {
    fontSize: 13,
    color: '#9AA6C4',
  },
  rowValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 2,
  },
  logoutButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#D2232A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
