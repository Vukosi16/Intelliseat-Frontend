import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopLogoSection from '../../components/TopLogoSection';
import { request } from '../../api';
import { useAuth } from '../../context/AuthContext';

const ABSENCE_REASONS = ['Medical', 'Family emergency', 'Transport issue', 'Other'];
const formatStatus = (status) => String(status || '')
  .split('_')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');
const EMPTY_EXAM = {
  _id: null,
  name: 'No assessment selected',
  type: 'Assessment',
  status: 'Unavailable',
  details: [
    { label: 'Date', value: 'Not set' },
    { label: 'Time', value: 'Not set' },
    { label: 'Lab', value: 'Not assigned' },
    { label: 'PC Number', value: 'Available 1 hour before the assessment' },
    { label: 'Module', value: 'Not set' },
    { label: 'Eligibility', value: 'Not available' },
  ],
};

export default function NextExam({ navigation, route }) {
  const { user } = useAuth();
  const assessment = route?.params?.assessment;
  const eligibilityApproved = user?.eligibility === 'eligible';
  const eligibilityStatus = eligibilityApproved ? 'Eligible' : 'Needs review';
  const examData = assessment ? {
    _id: assessment._id,
    name: assessment.name || EMPTY_EXAM.name,
    type: assessment.type || 'Type not set',
    status: assessment.status || EMPTY_EXAM.status,
    details: [
      { label: 'Date', value: assessment.startsAt ? new Date(assessment.startsAt).toLocaleDateString() : 'Not set' },
      { label: 'Time', value: assessment.startsAt ? `${new Date(assessment.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${assessment.endsAt ? ' – ' + new Date(assessment.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}` : 'Not set' },
      { label: 'Lab', value: assessment.venueId?.name || assessment.venueName || 'Not assigned' },
      { label: 'PC Number', value: 'Available 1 hour before the assessment' },
      { label: 'Module', value: assessment.moduleId?.name || assessment.name || 'Not set' },
      { label: 'Eligibility', value: eligibilityStatus },
    ],
  } : {
    ...EMPTY_EXAM,
    details: EMPTY_EXAM.details.map((item) => item.label === 'Eligibility'
      ? { ...item, value: eligibilityStatus }
      : item),
  };
  const assessmentId = examData._id || assessment?._id;

  const [attendanceConfirmed, setAttendanceConfirmed] = useState(false);
  const [attendanceVerified, setAttendanceVerified] = useState(false);
  const [verifiedBy, setVerifiedBy] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [openSection, setOpenSection] = useState(null);
  const [absenceReason, setAbsenceReason] = useState('');
  const [absenceDetails, setAbsenceDetails] = useState('');
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(Boolean(assessmentId));

  const loadAttendance = useCallback(async () => {
    if (!assessmentId) {
      setAttendanceLoading(false);
      return;
    }
    setAttendanceLoading(true);
    try {
      const result = await request(`/api/assessments/${assessmentId}/attendance`);
      setAttendanceConfirmed(Boolean(result?.confirmed));
      setAttendanceVerified(Boolean(result?.verified));
      setVerifiedBy(result?.verifiedBy || '');
      setSeatNumber(result?.seat?.label || '');
      if (result?.confirmed && !result?.seat?.label) {
        setActionError('Attendance confirmed. Your PC number will be available 1 hour before the assessment.');
      } else if (result?.seat?.label) {
        setActionError(`Attendance confirmed. Your assigned PC is ${result.seat.label}.`);
      }
    } catch (requestError) {
      setActionError(requestError.message || 'Could not load your attendance status.');
    } finally {
      setAttendanceLoading(false);
    }
  }, [assessmentId]);

  useFocusEffect(
    useCallback(() => {
      loadAttendance();
    }, [loadAttendance])
  );

  const requestAttendance = useCallback(async () => {
    if (!assessmentId || submitting) return;
    setSubmitting(true);
    setActionError('');
    try {
      const result = await request(`/api/assessments/${assessmentId}/attendance`, {
        method: 'POST',
        body: JSON.stringify({ status: 'confirmed' }),
      });
      setAttendanceConfirmed(true);
      setAttendanceVerified(Boolean(result?.verified));
      setVerifiedBy(result?.verifiedBy || '');
      if (result?.seat?.label) {
        setSeatNumber(result.seat.label);
        setActionError(`Attendance confirmed. Your assigned PC is ${result.seat.label}.`);
      } else {
        setActionError('Attendance confirmed. Your PC number will be available 1 hour before the assessment.');
      }
    } catch (requestError) {
      setActionError(requestError.message || 'Could not confirm attendance.');
    } finally {
      setSubmitting(false);
    }
  }, [assessmentId, submitting]);

  async function confirmAttendance() {
    if (!assessmentId || submitting || attendanceLoading) return;
    if (attendanceConfirmed) {
      await loadAttendance();
      return;
    }
    await requestAttendance();
  }

  useEffect(() => {
    if (!attendanceConfirmed || seatNumber || !assessment?.startsAt) return undefined;
    const revealAt = new Date(assessment.startsAt).getTime() - 60 * 60 * 1000;
    const timer = setTimeout(loadAttendance, Math.max(0, revealAt - Date.now()));
    return () => clearTimeout(timer);
  }, [assessment?.startsAt, attendanceConfirmed, loadAttendance, seatNumber]);

  async function submitAbsence() {
    if (!absenceReason) {
      setActionError('Select a reason before submitting.');
      return;
    }
    setSubmitting(true);
    setActionError('');
    try {
      await request(`/api/assessments/${assessmentId}/absence`, {
        method: 'POST',
        body: JSON.stringify({ reason: absenceReason, details: absenceDetails.trim() }),
      });
      setOpenSection(null);
      setAbsenceReason('');
      setAbsenceDetails('');
    } catch (requestError) {
      setActionError(requestError.message || 'Could not submit absence.');
    } finally {
      setSubmitting(false);
    }
  }

  // Opening one section closes the other. Tapping an open one closes it.
  function toggleSection(name) {
    setOpenSection(openSection === name ? null : name);
  }

  return (
<SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <TopLogoSection />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <Text style={styles.pageTitle}>Next Exam</Text>
        <Text style={styles.pageSubtitle}>View your assessment details and manage your attendance.</Text>
        {!eligibilityApproved && (
          <Text style={styles.eligibilityNotice}>
            Your assessment eligibility needs review. Please visit the admin.
          </Text>
        )}

        {/* Exam details card */}
        <View style={styles.card}>
          <View style={styles.examHeader}>
            <View>
              <Text style={styles.examName}>{examData.name}</Text>
              <Text style={styles.mutedText}>{examData.type}</Text>
            </View>
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingBadgeText}>{formatStatus(examData.status)}</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            {examData.details.map((item) => (
              <View key={item.label} style={styles.detailItem}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>
                  {item.label === 'PC Number' ? seatNumber || item.value : item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Confirm attendance */}
        {!!actionError && openSection !== 'absence' && (
          <Text style={styles.mutedText}>{actionError}</Text>
        )}
        <TouchableOpacity
          style={[styles.primaryButton, attendanceConfirmed && styles.confirmedButton, !eligibilityApproved && styles.disabledButton]}
          onPress={confirmAttendance}
          disabled={!eligibilityApproved || submitting || attendanceLoading}
        >
          <Text style={styles.buttonText}>
            {!eligibilityApproved
              ? 'Eligibility Needs Review'
              : attendanceLoading
                ? 'Loading attendance…'
                : seatNumber
                  ? 'PC number available'
                  : submitting
                    ? 'Saving…'
                    : attendanceConfirmed
                      ? 'Attendance confirmed'
                      : 'Confirm Attendance'}
          </Text>
        </TouchableOpacity>
        {attendanceVerified && (
          <View style={styles.verifiedNotice} accessibilityLiveRegion="polite">
            <Text style={styles.verifiedNoticeText}>
              Verified by invigilator{verifiedBy ? ` ${verifiedBy}` : ''}.
            </Text>
          </View>
        )}

        {/* Report absence */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('absence')}>
          <Text style={styles.sectionTitle}>Report Absence</Text>
          <Text style={styles.sectionArrow}>{openSection === 'absence' ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {openSection === 'absence' && (
          <View style={styles.sectionBody}>
            <Text style={styles.label}>Reason</Text>
            <View style={styles.reasonRow}>
              {ABSENCE_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[styles.reasonChip, absenceReason === reason && styles.reasonChipSelected]}
                  onPress={() => setAbsenceReason(reason)}
                >
                  <Text style={styles.reasonChipText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Additional details (optional)</Text>
            <TextInput
              value={absenceDetails}
              onChangeText={setAbsenceDetails}
              style={styles.textArea}
              placeholder="Add more context..."
              multiline
              maxLength={500}
            />

            {!!actionError && <Text style={styles.mutedText}>{actionError}</Text>}
            <TouchableOpacity style={styles.primaryButton} onPress={submitAbsence} disabled={submitting}>
              <Text style={styles.buttonText}>{submitting ? 'Submitting…' : 'Submit Absence'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Support */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => navigation.navigate('StudentSupport', { openNewIssue: true, assessmentId })}
        >
          <Text style={styles.sectionTitle}>Report an Issue</Text>
          <Text style={styles.sectionArrow}>→</Text>
        </TouchableOpacity>

        {/* Show QR code. Needs a 'QrCode' screen in registry.js */}
        {/* will be implemented in the future. For now, it is just a placeholder button.   */}
        <TouchableOpacity
          style={[styles.qrButton, !eligibilityApproved && styles.disabledButton]}
          disabled={!eligibilityApproved}
          onPress={() =>
            navigation.navigate('StudentQRCode', {
              assessment: assessment || {
                _id: examData._id,
                name: examData.name,
                date: examData.details[0].value,
                startTime: examData.details[1].value,
                venueName: examData.details[2].value,
              },
              exam: {
                name: examData.name,
                date: examData.details[0].value,
                time: examData.details[1].value,
                lab: examData.details[2].value,
              },
            })
          }
        >
          <Text style={styles.buttonText}>Show My QR Code</Text>
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
  eligibilityNotice: {
    marginHorizontal: 20,
    marginBottom: 12,
    color: '#FFD18A',
    fontSize: 14,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Text
  pageTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#9AA6C4',
    marginTop: 10,
    marginBottom: 20,
  },
  mutedText: {
    fontSize: 13,
    color: '#9AA6C4',
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    marginBottom: 6,
  },

  // Exam card
  card: {
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  examName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  upcomingBadge: {
    backgroundColor: '#F6EAD3',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  upcomingBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#B4791E',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  detailItem: {
    width: '50%',
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 13,
    color: '#9AA6C4',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 2,
  },

  // Buttons
  primaryButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2A52A8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  confirmedButton: {
    backgroundColor: '#1D8A55',
  },
  verifiedNotice: {
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#45B883',
    backgroundColor: '#123F38',
  },
  verifiedNoticeText: {
    color: '#B9F2D5',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  qrButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#D2232A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },

  // Collapsible sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  sectionArrow: {
    fontSize: 12,
    color: '#9AA6C4',
  },
  sectionBody: {
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    padding: 14,
    marginTop: 6,
  },

  // Inputs
  reasonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reasonChip: {
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  reasonChipSelected: {
    backgroundColor: '#2A52A8',
    borderColor: '#2A52A8',
  },
  reasonChipText: {
    fontSize: 13,
    color: 'white',
  },
  textArea: {
    height: 90,
    borderWidth: 1.5,
    borderColor: '#122B63',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#E7ECF9',
    color: '#000000',
    textAlignVertical: 'top',
  },
});