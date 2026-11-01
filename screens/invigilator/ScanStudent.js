import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRef, useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import NavBar from '../../components/NavBar';
import { request } from '../../api';

const DEFAULT_ASSESSMENT = {
  _id: 'demo-assessment',
  moduleCode: 'NET731',
  name: 'Networks',
  venue: { _id: 'demo-venue', name: 'Lab 03' },
  date: '2026-10-16',
  startTime: '10:00',
  endTime: '12:00',
};

const DEMO_STUDENT = {
  _id: 'demo-student',
  studentNumber: '402410233',
  firstName: 'Mudanabula',
  lastName: 'D.',
  eligibility: 'eligible',
  seat: { _id: 'demo-seat-1', label: 'PC 1' },
};

function venueName(assessment) {
  return (
    assessment?.venue?.name ||
    assessment?.venueId?.name ||
    assessment?.venueName ||
    assessment?.lab ||
    assessment?.labs ||
    'Lab'
  );
}

function assessmentWhen(assessment) {
  if (assessment?.date && assessment?.startTime) {
    return `${assessment.date} · ${assessment.startTime}`;
  }
  if (assessment?.startsAt) {
    const start = new Date(assessment.startsAt);
    return `${start.toLocaleDateString()} · ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return '';
}

function normalizeStudent(student) {
  const payload = student?.student || student;
  const name =
    payload.name ||
    `${payload.firstName || ''} ${payload.lastName || ''}`.trim() ||
    'Student';
  return {
    ...payload,
    name,
    studentNumber: payload.studentNumber || '—',
    pc: payload.seat?.label || payload.seatNumber || payload.pc || 'Unassigned',
    eligibility: payload.eligibility || 'eligible',
  };
}

export default function ScanStudent({ navigation, route }) {
  const assessment = route?.params?.assessment ?? route?.params?.session?.raw ?? DEFAULT_ASSESSMENT;
  const session = route?.params?.session;
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const hasScanned = useRef(false);

  useFocusEffect(
    useCallback(() => {
      hasScanned.current = false;
    }, [])
  );

  function openStudentDetail(student) {
    navigation.navigate('StudentProfileInv', {
      assessment,
      session,
      student: normalizeStudent(student),
    });
  }

  async function handleScan(result) {
    if (hasScanned.current || scanning) return;
    hasScanned.current = true;
    setScanning(true);
    setError('');
    try {
      const student = await request('/api/assessments/scan', {
        method: 'POST',
        body: JSON.stringify({ assessmentId: assessment._id, qrToken: result.data }),
      });
      openStudentDetail(student);
    } catch (requestError) {
      hasScanned.current = false;
      setError(requestError.message);
    } finally {
      setScanning(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <NavBar alertsScreen="InvigilatorAlerts" profileScreen="InvigilatorProfile" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sessionCard}>
          <Text style={styles.sessionName}>
            {assessment.moduleCode ? `${assessment.moduleCode} — ${assessment.name}` : assessment.name}
          </Text>
          <Text style={styles.sessionDetails}>{assessment.type || 'Type not set'}</Text>
          <Text style={styles.sessionDetails}>
            {venueName(assessment)} · {assessmentWhen(assessment)}
          </Text>
        </View>

        <Text style={styles.pageTitle}>Scan Student QR Code</Text>
        <Text style={styles.pageSubtitle}>Point the camera at the student's QR code.</Text>
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {permission === null && <Text style={styles.mutedText}>Checking camera access...</Text>}

        {permission !== null && !permission.granted && (
          <View style={styles.card}>
            <Text style={styles.cardText}>The app needs camera access to scan QR codes.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
              <Text style={styles.buttonText}>Allow Camera</Text>
            </TouchableOpacity>
          </View>
        )}

        {permission !== null && permission.granted && (
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleScan}
          />
        )}

        {__DEV__ && (
          <TouchableOpacity style={styles.ghostButton} onPress={() => openStudentDetail(DEMO_STUDENT)}>
            <Text style={styles.buttonText}>Use demo student</Text>
          </TouchableOpacity>
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
    fontSize: 14,
    color: '#9AA6C4',
  },
  errorText: {
    color: '#FFB4AB',
    marginBottom: 12,
  },
  camera: {
    height: 340,
    borderRadius: 8,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    padding: 16,
  },
  cardText: {
    fontSize: 15,
    color: 'white',
    lineHeight: 22,
  },
  primaryButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2A52A8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  ghostButton: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
