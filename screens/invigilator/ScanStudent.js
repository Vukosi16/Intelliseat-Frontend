import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import NavBar from '../../components/NavBar';

// Used for previewing the page on its own. When you arrive from the session page,
// the real session is passed in with navigation.navigate('ScanStudent', { session }).
const DEFAULT_SESSION = { name: 'DIT (3rd Year): Networks 731', lab: 'Lab 03', date: 'Fri, 16 Oct', time: '10:00' };

// Later: the scanned QR token is sent to the backend, which checks it is valid, not expired and
// not used before, then returns the student. For now every scan returns this placeholder student.
const DEMO_STUDENT = { name: 'Mudanabula D.', studentNumber: '402410233', pc: 'PC 1', eligibility: 'Eligible' };

export default function ScanStudent({ navigation, route }) {
  const session = route?.params?.session ?? DEFAULT_SESSION;
  const [permission, requestPermission] = useCameraPermissions();

  // Stops the camera from opening the student page many times while it still sees the same QR code
  const hasScanned = useRef(false);

  // Allow scanning again each time we come back to this page
  useFocusEffect(
    useCallback(() => {
      hasScanned.current = false;
    }, [])
  );

  function openStudentDetail(student) {
    if (hasScanned.current) return;
    hasScanned.current = true;
    navigation.navigate('StudentProfileInv', { session, student });
  }

  // Called when the camera reads a QR code
  function handleScan(result) {
    // result.data is the QR token. Later, look the student up with it.
    openStudentDetail(DEMO_STUDENT);
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

        <Text style={styles.pageTitle}>Scan Student QR Code</Text>
        <Text style={styles.pageSubtitle}>Point the camera at the student's QR code.</Text>

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

        {/* For testing without a real QR code */}
        <TouchableOpacity style={styles.ghostButton} onPress={() => openStudentDetail(DEMO_STUDENT)}>
          <Text style={styles.buttonText}>Use demo student</Text>
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

  // Page text
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

  // Camera
  camera: {
    height: 340,
    borderRadius: 8,
    overflow: 'hidden',
  },

  // Permission card
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

  // Buttons
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