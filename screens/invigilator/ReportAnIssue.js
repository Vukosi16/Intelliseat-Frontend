import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';
import { request } from '../../api';

// Used for previewing the page on its own. When you arrive from another screen,
// the real details are passed in with navigation.navigate('ReportIssue', { session, pc }).
const DEFAULT_SESSION = { name: 'DIT (3rd Year): Networks 731', lab: 'Lab 03', date: 'Fri, 16 Oct', time: '10:00' };
const DEFAULT_PC = 'PC 1';

export default function ReportIssue({ route }) {
  const session = route?.params?.session ?? DEFAULT_SESSION;
  const pc = route?.params?.pc ?? DEFAULT_PC;
  const seatId = route?.params?.seatId
    || route?.params?.seat?._id
    || route?.params?.seatId?._id;
  const venueId = route?.params?.venueId
    || route?.params?.seat?.venueId?._id
    || route?.params?.seat?.venueId
    || session.venueId?._id
    || session.venueId
    || session.venue?._id;

  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pcStatus, setPcStatus] = useState(null); // 'verified' (greenlist), 'faulty' (redlist) or null
  const [submittedIssueId, setSubmittedIssueId] = useState(null);
  const [submittedIssueReason, setSubmittedIssueReason] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const assessmentId = session._id || session.id || session.raw?._id;

  async function handleSubmit() {
    if (reason.trim() === '') {
      setError('Describe the issue before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const createdIssue = await request('/api/issues', {
        method: 'POST',
        body: JSON.stringify({
          category: 'other',
          description: reason.trim(),
          assessmentId,
          seat: pc,
          ...(seatId ? { seatId } : {}),
          ...(venueId ? { venueId } : {}),
        }),
      });
      setSubmittedIssueId(createdIssue?._id || null);
      setSubmittedIssueReason(reason.trim());
      setSubmitted(true);
      setReason('');
    } catch (requestError) {
      setError(requestError.message || 'Failed to submit issue.');
    } finally {
      setSubmitting(false);
    }
  }

  async function markPcStatus(status) {
    setError('');
    setStatusMessage('');
    if (!seatId) {
      setError('This PC is missing its seat ID. Open this page from the lab map or student profile to update its status.');
      return;
    }
    try {
      const result = await request(`/api/seats/${seatId}/condition`, {
        method: 'PATCH',
        body: JSON.stringify({
          condition: status === 'faulty' ? 'faulty' : 'working',
          faultyReason: status === 'faulty'
            ? submittedIssueReason || reason.trim() || 'Marked faulty by invigilator'
            : undefined,
          ...(assessmentId ? { assessmentId } : {}),
          ...(status === 'faulty' && submittedIssueId ? { issueId: submittedIssueId } : {}),
        }),
      });
      setPcStatus(status);
      setStatusMessage(status === 'faulty' && result.studentsWithoutReplacement > 0
        ? `PC marked faulty and issue recorded. ${result.studentsWithoutReplacement} affected student(s) need a replacement seat.`
        : `${pc} marked ${status === 'faulty' ? 'faulty' : 'working'}.`);
    } catch (requestError) {
      setError(requestError.message || 'Could not update PC status.');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <NavBar alertsScreen="InvigilatorAlerts" profileScreen="InvigilatorProfile" />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Session details */}
        <View style={styles.sessionCard}>
          <Text style={styles.sessionName}>{session.name}</Text>
          <Text style={styles.sessionDetails}>{session.type || 'Type not set'}</Text>
          <Text style={styles.sessionDetails}>
            {session.lab} · {session.date} · {session.time}
          </Text>
        </View>

        {/* Report the issue */}
        <Text style={styles.pageTitle}>Report an issue</Text>
        <Text style={styles.pageSubtitle}>{pc}</Text>

        <TextInput
          value={reason}
          onChangeText={(text) => {
            setReason(text);
            setError('');
            setSubmitted(false);
          }}
          style={styles.textArea}
          placeholder="Input reason here"
          multiline
          maxLength={500}
        />
        {error !== '' && <Text style={styles.errorText}>{error}</Text>}
        {submitted && <Text style={styles.successText}>Issue submitted.</Text>}

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.buttonText}>{submitting ? 'Submitting…' : 'Submit'}</Text>
        </TouchableOpacity>

        {/* Mark the PC */}
        <Text style={styles.sectionTitle}>Mark PC status</Text>

        <View style={styles.statusRow}>
          <TouchableOpacity
            style={[styles.statusButton, styles.verifiedButton, pcStatus === 'verified' && styles.statusSelected]}
            onPress={() => markPcStatus('verified')}
          >
            <Text style={styles.verifiedText}>PC Verified</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statusButton, styles.faultyButton, pcStatus === 'faulty' && styles.statusSelected]}
            onPress={() => markPcStatus('faulty')}
          >
            <Text style={styles.faultyText}>PC Faulty</Text>
          </TouchableOpacity>
        </View>

        {!!statusMessage && (
          <Text style={styles.statusMessage}>
            {statusMessage}
          </Text>
        )}

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
    marginBottom: 20,
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

  // Page text
  pageTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#9AA6C4',
    marginTop: 6,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 32,
    marginBottom: 12,
  },

  // Form
  textArea: {
    height: 120,
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
  successText: {
    fontSize: 13,
    color: '#7FD9A8',
    marginTop: 8,
  },
  primaryButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2A52A8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },

  // PC status buttons
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    width: '48%',
    height: 56,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedButton: {
    backgroundColor: '#E1F3E8',
  },
  faultyButton: {
    backgroundColor: '#FBE4E3',
  },
  statusSelected: {
    borderColor: 'white',
  },
  verifiedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D8A55',
  },
  faultyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D2232A',
  },
  statusMessage: {
    fontSize: 14,
    color: 'white',
    marginTop: 14,
  },
});