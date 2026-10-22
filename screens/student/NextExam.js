import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopLogoSection from '../../components/TopLogoSection';

// Later this comes from the backend. For now it is hardcoded so the screen can be previewed.
const EXAM = {
  name: 'Database Systems',
  type: 'CA Test',
  status: 'Upcoming',
  details: [
    { label: 'Date', value: '5 Oct 2026 (Mon)' },
    { label: 'Time', value: '08:00 – 10:00' },
    { label: 'Lab', value: 'Lab 3' },
    { label: 'PC Number', value: 'PC 24' },
    { label: 'Module', value: 'Database Systems' },
    { label: 'Eligibility', value: 'Eligible' },
  ],
};

const ABSENCE_REASONS = ['Medical', 'Family emergency', 'Transport issue', 'Other'];

export default function NextExam({ navigation }) {
  const [attendanceConfirmed, setAttendanceConfirmed] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [absenceReason, setAbsenceReason] = useState('');
  const [absenceDetails, setAbsenceDetails] = useState('');

  // Opening one section closes the other. Tapping an open one closes it.
  function toggleSection(name) {
    setOpenSection(openSection === name ? null : name);
  }

  return (
<SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <TopLogoSection />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <Text style={styles.pageTitle}>Next Exam</Text>
        <Text style={styles.pageSubtitle}>View your assessment details and manage your attendance.</Text>

        {/* Exam details card */}
        <View style={styles.card}>
          <View style={styles.examHeader}>
            <View>
              <Text style={styles.examName}>{EXAM.name}</Text>
              <Text style={styles.mutedText}>{EXAM.type}</Text>
            </View>
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingBadgeText}>{EXAM.status}</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            {EXAM.details.map((item) => (
              <View key={item.label} style={styles.detailItem}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Confirm attendance */}
        <TouchableOpacity
          style={[styles.primaryButton, attendanceConfirmed && styles.confirmedButton]}
          // will map to a backend API call in the future. For now, it just changes the button text.
          onPress={() => setAttendanceConfirmed(true)}
        >
          <Text style={styles.buttonText}>
            {attendanceConfirmed ? 'Attendance confirmed' : 'Confirm Attendance'}
          </Text>
        </TouchableOpacity>

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

            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.buttonText}>Submit Absence</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Support */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => navigation.navigate('StudentSupport', { openNewIssue: true })}
        >
          <Text style={styles.sectionTitle}>Report an Issue</Text>
          <Text style={styles.sectionArrow}>→</Text>
        </TouchableOpacity>

        {/* Show QR code. Needs a 'QrCode' screen in registry.js */}
        {/* will be implemented in the future. For now, it is just a placeholder button.   */}
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() =>
            navigation.navigate('StudentQRCode', {
              exam: {
                name: EXAM.name,
                date: EXAM.details[0].value,
                time: EXAM.details[1].value,
                lab: EXAM.details[2].value,
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