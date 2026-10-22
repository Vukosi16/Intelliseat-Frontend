import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';

// Used for previewing the page on its own. When you arrive from the scan page,
// the real details are passed in with navigation.navigate('StudentDetail', { session, student }).
const DEFAULT_SESSION = { name: 'DIT (3rd Year): Networks 731', lab: 'Lab 03', date: 'Fri, 16 Oct', time: '10:00' };
const DEFAULT_STUDENT = { name: 'Mudanabula D.', studentNumber: '402410233', pc: 'PC 1', eligibility: 'Eligible' };

// Later this comes from the lab map (the vacant, working PCs).
const VACANT_PCS = ['PC 4', 'PC 10', 'PC 13', 'PC 15'];

export default function StudentDetail({ navigation, route }) {
  const session = route?.params?.session ?? DEFAULT_SESSION;

  // The student is kept in state because the random seat generator can change their PC
  const [student, setStudent] = useState(route?.params?.student ?? DEFAULT_STUDENT);
  const [verified, setVerified] = useState(false);
  const [seatMessage, setSeatMessage] = useState('');

  function giveRandomSeat() {
    const newPc = VACANT_PCS[Math.floor(Math.random() * VACANT_PCS.length)];
    setStudent({ ...student, pc: newPc });
    setSeatMessage(`New seat: ${newPc}`);
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <NavBar alertsScreen="InvigilatorAlerts" profileScreen="InvigilatorProfile" />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Session details */}
        <View style={styles.sessionCard}>
          <Text style={styles.sessionName}>{session.name}</Text>
          <Text style={styles.sessionDetails}>
            {session.lab} · {session.date} · {session.time}
          </Text>
        </View>

        {/* Student information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.studentName}>{student.name}</Text>
            <View style={styles.eligibleBadge}>
              <Text style={styles.eligibleBadgeText}>{student.eligibility}</Text>
            </View>
          </View>
          <Text style={styles.mutedText}>
            {student.studentNumber} · {student.pc}
          </Text>
        </View>

        {/* Verify and log */}
        <TouchableOpacity
          style={[styles.actionButton, styles.verifyButton, verified && styles.verifiedButton]}
          onPress={() => setVerified(true)}
        >
          <Text style={styles.actionTitle}>
            {verified ? 'Student verified and logged' : 'Verify & Log Student Register'}
          </Text>
        </TouchableOpacity>

        {/* Random seat */}
        <TouchableOpacity style={styles.actionButton} onPress={giveRandomSeat}>
          <Text style={styles.actionTitle}>Random Student Seat Generator</Text>
          {seatMessage !== '' && <Text style={styles.actionSubtitle}>{seatMessage}</Text>}
        </TouchableOpacity>

        {/* Report an issue */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ReportIssue', { session, pc: student.pc })}
        >
          <Text style={styles.actionTitle}>Report an Issue</Text>
        </TouchableOpacity>

        {/* Expel */}
        <TouchableOpacity
          style={[styles.actionButton, styles.expelButton]}
          onPress={() =>
            navigation.navigate('ExpelStudent', {
              session,
              student: { name: student.name, pc: student.pc },
            })
          }
        >
          <Text style={styles.actionTitle}>Expel Student</Text>
        </TouchableOpacity>

        {/* Back to the scanner */}
        <TouchableOpacity style={styles.ghostButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Scan another student</Text>
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

  // Student card
  card: {
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  mutedText: {
    fontSize: 14,
    color: '#9AA6C4',
    marginTop: 4,
  },
  eligibleBadge: {
    backgroundColor: '#E1F3E8',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  eligibleBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1D8A55',
  },

  // Action buttons
  actionButton: {
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    padding: 18,
    marginBottom: 12,
  },
  verifyButton: {
    backgroundColor: '#1D8A55',
    borderColor: '#1D8A55',
  },
  verifiedButton: {
    backgroundColor: '#14663F',
    borderColor: '#14663F',
  },
  expelButton: {
    backgroundColor: '#D2232A',
    borderColor: '#D2232A',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#9AA6C4',
    marginTop: 4,
  },

  // Back button
  ghostButton: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#1B3C82',
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