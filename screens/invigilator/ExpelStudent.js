import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';

// Used for previewing the page on its own. When you arrive from another screen,
// the real session and student are passed in with navigation.navigate('ExpelStudent', { session, student }).
const DEFAULT_SESSION = { name: 'DIT (3rd Year): Networks 731', lab: 'Lab 03', date: 'Fri, 16 Oct', time: '10:00' };
const DEFAULT_STUDENT = { name: 'Mudanabula D.', pc: 'PC 1' };

export default function ExpelStudent({ navigation, route }) {
  const session = route?.params?.session ?? DEFAULT_SESSION;
  const student = route?.params?.student ?? DEFAULT_STUDENT;

  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  function handleExpel() {
    // A reason is required
    if (reason.trim() === '') {
      setError('Enter a reason before expelling the student.');
      return;
    }

    // Ask once more, because this cannot be undone
    Alert.alert(
      'Expel student?',
      `${student.name} will be removed from this session.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Expel',
          style: 'destructive',
          onPress: () => {
            // Later: send { student, session, reason } to the backend
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <NavBar alertsScreen="InvigilatorAlerts" profileScreen="InvigilatorProfile" />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Session details */}
        <View style={styles.sessionCard}>
          <Text style={styles.sessionName}>{session.name}</Text>
          <Text style={styles.sessionDetails}>
            {session.lab} · {session.date} · {session.time}
          </Text>
        </View>

        {/* Warning */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            This action will remove the student from the session. Please state a reason.
          </Text>
        </View>

        <Text style={styles.pageTitle}>Expel student</Text>
        <Text style={styles.studentText}>
          {student.name} · {student.pc}
        </Text>

        <Text style={styles.label}>Reason for expulsion</Text>
        <TextInput
          value={reason}
          onChangeText={(text) => {
            setReason(text);
            setError('');
          }}
          style={styles.textArea}
          placeholder="Reason for expulsion"
          multiline
          maxLength={500}
        />
        {error !== '' && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.expelButton} onPress={handleExpel}>
          <Text style={styles.buttonText}>Confirm Expulsion</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
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

  // Session card
  sessionCard: {
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  sessionDetails: {
    fontSize: 14,
    color: '#9AA6C4',
    marginTop: 4,
  },

  // Warning
  warningBox: {
    backgroundColor: '#FBE4E3',
    borderRadius: 8,
    padding: 14,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    color: '#AE1B21',
    lineHeight: 20,
  },

  // Form
  pageTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  studentText: {
    fontSize: 15,
    color: '#9AA6C4',
    marginTop: 6,
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  textArea: {
    height: 110,
    borderWidth: 1.5,
    borderColor: '#122B63',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#E7ECF9',
    color: '#000000',
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 13,
    color: '#FF8C86',
    marginTop: 8,
  },

  // Buttons
  expelButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#D2232A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  cancelButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2A52A8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});