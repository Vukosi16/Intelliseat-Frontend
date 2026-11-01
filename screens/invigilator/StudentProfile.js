import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';
import { request } from '../../api';

// Used for previewing the page on its own. When you arrive from the scan page,
// the real details are passed in with navigation.navigate('StudentDetail', { session, student }).
const DEFAULT_SESSION = { name: 'DIT (3rd Year): Networks 731', lab: 'Lab 03', date: 'Fri, 16 Oct', time: '10:00' };
const DEFAULT_STUDENT = { name: 'Mudanabula D.', studentNumber: '402410233', pc: 'PC 1', eligibility: 'Eligible' };

// Later this comes from the lab map (the vacant, working PCs).
const VACANT_PCS = ['PC 4', 'PC 10', 'PC 13', 'PC 15'];

export default function StudentDetail({ navigation, route }) {
  const session = route?.params?.session ?? DEFAULT_SESSION;
  const assessment = route?.params?.assessment || session.raw || session;
  const assessmentId = assessment._id || assessment.id || session._id || session.id;

  const incoming = route?.params?.student ?? DEFAULT_STUDENT;
  const [relatedIssue, setRelatedIssue] = useState(route?.params?.issue);
  const [student, setStudent] = useState({
    ...incoming,
    name:
      incoming.name ||
      `${incoming.firstName || ''} ${incoming.lastName || ''}`.trim() ||
      DEFAULT_STUDENT.name,
    pc: incoming.pc
      || incoming.seat?.label
      || (incoming.seat?.number ? `PC ${incoming.seat.number}` : '')
      || incoming.seatNumber
      || DEFAULT_STUDENT.pc,
  });
  const [verified, setVerified] = useState(Boolean(incoming.verified || incoming.verifiedAt));
  const [seatMessage, setSeatMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [seatUpdateInProgress, setSeatUpdateInProgress] = useState(false);
  const [issueUpdateInProgress, setIssueUpdateInProgress] = useState(false);
  const [pendingFaultySeat, setPendingFaultySeat] = useState(null);
  const [faultySeat, setFaultySeat] = useState(relatedIssue?.seatId?._id ? {
    id: relatedIssue.seatId._id,
    label: relatedIssue.seatId.label || 'Reported seat',
  } : null);
  const studentId = student._id || student.id;
  const currentSeatId = student.seat?._id || student.seatId?._id || student.seatId;

  async function verifyStudent() {
    setActionError('');
    try {
      if (assessmentId && studentId) {
        await request(`/api/assessments/${assessmentId}/check-in`, {
          method: 'POST',
          body: JSON.stringify({ studentId }),
        });
      }
      setVerified(true);
    } catch (requestError) {
      setActionError(requestError.message || 'Could not verify student.');
    }
  }

  async function giveRandomSeat() {
    setActionError('');
    try {
      if (assessmentId && studentId) {
        const result = await request(`/api/assessments/${assessmentId}/reassign-seat`, {
          method: 'POST',
          body: JSON.stringify({ studentId }),
        });
        const newPc = result.seat?.label || result.pc || result.seatNumber;
        if (newPc) {
          setStudent({ ...student, pc: newPc, seat: result.seat });
          setSeatMessage(`New seat: ${newPc}`);
          return;
        }
      }
      const newPc = VACANT_PCS[Math.floor(Math.random() * VACANT_PCS.length)];
      setStudent({ ...student, pc: newPc });
      setSeatMessage(`New seat: ${newPc}`);
    } catch (requestError) {
      setActionError(requestError.message || 'Could not reassign seat.');
    }
  }

  async function replaceFaultySeat() {
    if (pendingFaultySeat) {
      setSeatUpdateInProgress(true);
      setActionError('');
      try {
        await markSeatFaulty(pendingFaultySeat);
        setSeatMessage(`${student.name} is assigned to ${student.pc}; ${pendingFaultySeat.label} marked not working.`);
        setPendingFaultySeat(null);
      } catch (seatError) {
        setActionError(`Student has been moved, but ${pendingFaultySeat.label} could not be marked not working: ${seatError.message}`);
      } finally {
        setSeatUpdateInProgress(false);
      }
      return;
    }

    if (!assessmentId || !studentId || !currentSeatId) {
      setActionError('The assessment, student, or current seat details are missing. The seat could not be replaced.');
      return;
    }

    setSeatUpdateInProgress(true);
    setActionError('');
    setSeatMessage('');
    const previousSeatLabel = student.seat?.label || student.pc;

    try {
      const result = await request(`/api/assessments/${assessmentId}/reassign-seat`, {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      });
      if (!result.seat?._id) {
        throw new Error('The student was reassigned, but the new seat details were not returned.');
      }

      const newSeatLabel = result.seat.label || (result.seat.number ? `PC ${result.seat.number}` : 'New seat');
      setStudent((current) => ({ ...current, pc: newSeatLabel, seat: result.seat, seatId: result.seat._id }));
      const previousSeat = {
        id: currentSeatId,
        label: previousSeatLabel,
        reason: relatedIssue?.description || 'Marked not working by invigilator',
      };
      setFaultySeat(previousSeat);
      setPendingFaultySeat(previousSeat);

      try {
        await markSeatFaulty(previousSeat);
        setPendingFaultySeat(null);
        setSeatMessage(`${student.name} moved to ${newSeatLabel}; ${previousSeatLabel} marked not working.`);
      } catch (seatError) {
        setActionError(`Student moved to ${newSeatLabel}, but ${previousSeatLabel} could not be marked not working. Use the button to retry: ${seatError.message}`);
      }
    } catch (requestError) {
      setActionError(requestError.message || 'Could not replace the student’s seat.');
    } finally {
      setSeatUpdateInProgress(false);
    }
  }

  async function markSeatFaulty(seat) {
    await request(`/api/seats/${seat.id}/condition`, {
      method: 'PATCH',
      body: JSON.stringify({
        condition: 'faulty',
        faultyReason: seat.reason,
        ...(relatedIssue?._id ? { issueId: relatedIssue._id } : {}),
        ...(assessmentId ? { assessmentId } : {}),
      }),
    });
  }

  async function markIssueDealtWith() {
    if (!relatedIssue?._id) {
      setActionError('This issue cannot be updated because its ID is unavailable.');
      return;
    }
    setIssueUpdateInProgress(true);
    setActionError('');
    try {
      const updatedIssue = await request(`/api/issues/${relatedIssue._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'resolved',
          confirmResolution: true,
          ...(faultySeat?.id ? { seatId: faultySeat.id } : {}),
        }),
      });
      setRelatedIssue((current) => ({ ...current, ...updatedIssue }));
    } catch (requestError) {
      setActionError(requestError.message || 'Could not mark the issue as dealt with.');
    } finally {
      setIssueUpdateInProgress(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <NavBar alertsScreen="InvigilatorAlerts" profileScreen="InvigilatorProfile" />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Session details */}
        <View style={styles.sessionCard}>
          <Text style={styles.sessionName}>{session.name}</Text>
          <Text style={styles.sessionDetails}>{session.type || 'Type not set'}</Text>
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

        {relatedIssue && (
          <View style={styles.reportedIssueCard}>
            <Text style={styles.reportedIssueTitle}>Reported issue</Text>
            <Text style={styles.reportedIssueMeta}>
              {String(relatedIssue.category || 'other').replace(/_/g, ' ')} · {relatedIssue.status === 'resolved' ? 'Dealt with' : relatedIssue.status === 'in_progress' ? 'In progress' : 'Open'}
            </Text>
            <Text style={styles.reportedIssueDescription}>{relatedIssue.description}</Text>
            {relatedIssue.status !== 'resolved' && (
              <TouchableOpacity
                accessibilityRole="button"
                disabled={issueUpdateInProgress}
                style={[styles.issueResolvedButton, issueUpdateInProgress && styles.disabledButton]}
                onPress={markIssueDealtWith}
              >
                {issueUpdateInProgress ? (
                  <ActivityIndicator color="#0B1E4A" />
                ) : (
                  <Text style={styles.issueResolvedButtonText}>Mark issue dealt with</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity
          accessibilityRole="button"
          disabled={seatUpdateInProgress}
          style={[styles.actionButton, styles.faultySeatButton, seatUpdateInProgress && styles.disabledButton]}
          onPress={replaceFaultySeat}
        >
          {seatUpdateInProgress ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.actionTitle}>
              {pendingFaultySeat
                ? `Retry marking ${pendingFaultySeat.label} not working`
                : 'Assign another seat & mark current seat not working'}
            </Text>
          )}
        </TouchableOpacity>
        {!!seatMessage && <Text style={styles.seatSuccessText}>{seatMessage}</Text>}

        {/* Verify and log */}
        <TouchableOpacity
          style={[styles.actionButton, styles.verifyButton, verified && styles.verifiedButton]}
          onPress={verifyStudent}
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

        {!!actionError && <Text style={styles.mutedText}>{actionError}</Text>}

        {/* Report an issue */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ReportIssue', {
            session,
            pc: student.pc,
            seat: student.seat,
            seatId: currentSeatId,
            venueId: student.seat?.venueId?._id
              || student.seat?.venueId
              || session.venueId?._id
              || session.venueId,
          })}
        >
          <Text style={styles.actionTitle}>Report an Issue</Text>
        </TouchableOpacity>

        {/* Expel */}
        <TouchableOpacity
          style={[styles.actionButton, styles.expelButton]}
          onPress={() =>
            navigation.navigate('ExpelStudent', {
              session,
              student: { _id: studentId, name: student.name, pc: student.pc },
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
  reportedIssueCard: {
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#F0C36A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  reportedIssueTitle: {
    color: '#F0C36A',
    fontSize: 16,
    fontWeight: '700',
  },
  reportedIssueMeta: {
    color: '#C6CFEC',
    fontSize: 12,
    marginTop: 5,
    textTransform: 'capitalize',
  },
  reportedIssueDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  issueResolvedButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0C36A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
  },
  issueResolvedButtonText: {
    color: '#0B1E4A',
    fontSize: 14,
    fontWeight: '700',
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
  faultySeatButton: {
    borderColor: '#F0C36A',
  },
  disabledButton: {
    opacity: 0.65,
  },
  seatSuccessText: {
    color: '#6BD39A',
    fontSize: 14,
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