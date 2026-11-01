import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';
import { useAuth } from '../../context/AuthContext';

export default function StudentProfile({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const firstName = user?.firstName || 'Student';
  const lastName = user?.lastName || '';
  const initials = ((firstName[0] || 'S') + (lastName[0] || '')).toUpperCase();
  const studentNumber = user?.studentNumber || '—';
  const email = user?.email || '—';
  const course = user?.course || user?.program || 'Diploma in Information Technology';
  const year = user?.year || user?.academicYear || 'Year 2';
  const eligibility = user?.eligibility || (user?.isEligible !== false ? 'Eligible' : 'Not Eligible');

  // Each row in the details card
  const details = [
    { label: 'Student number', value: studentNumber },
    { label: 'Email', value: email },
    { label: 'Course', value: course },
    { label: 'Year of study', value: year },
  ];

  const handleLogout = async () => {
    await logout();
  };

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
      <NavBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar and name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>
            {firstName} {lastName}
          </Text>
          <View style={styles.eligibleBadge}>
            <Text style={styles.eligibleBadgeText}>{eligibility}</Text>
          </View>
        </View>

        {/* Details card */}
        <View style={styles.card}>
          {details.map((item, index) => (
            <View key={item.label} style={[styles.row, index === details.length - 1 && styles.lastRow]}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.helpText}>
          You can update your contact number below. Academic details remain administrator-managed.
        </Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Contact number" placeholderTextColor="#9AA6C4" keyboardType="phone-pad" />
        {!!message && <Text style={styles.helpText}>{message}</Text>}
        <TouchableOpacity style={styles.saveButton} onPress={saveProfile} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save profile'}</Text>
        </TouchableOpacity>

        {/* Log out */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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

  // Avatar section
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
  eligibleBadge: {
    backgroundColor: '#E1F3E8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
  },
  eligibleBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1D8A55',
  },

  // Details card
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
  helpText: {
    fontSize: 13,
    color: '#9AA6C4',
    textAlign: 'center',
    marginTop: 16,
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

  // Log out
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