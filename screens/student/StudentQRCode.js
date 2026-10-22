import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TopLogoSection from '../../components/TopLogoSection';

const DEFAULT_EXAM = {
  name: 'Database Systems',
  date: '5 Oct 2026',
  time: '08:00 – 10:00',
  lab: 'Lab 3',
};

export default function StudentQRCode({ navigation, route }) {
  const exam = route?.params?.exam ?? DEFAULT_EXAM;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <TopLogoSection />

      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back to exam details"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your QR Code</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Check-in QR code</Text>
        <Text style={styles.pageSubtitle}>
          Present this code to your invigilator when you arrive at the lab.
        </Text>

        <View style={styles.examCard}>
          <Text style={styles.examName}>{exam.name}</Text>
          <Text style={styles.examDetails}>
            {exam.date} · {exam.time} · {exam.lab}
          </Text>
        </View>

        <View style={styles.qrCard}>
          <View style={styles.qrBox}>
            <View style={styles.qrPattern}>
              <QrMarker style={styles.topLeftMarker} />
              <QrMarker style={styles.topRightMarker} />
              <QrMarker style={styles.bottomLeftMarker} />
              <View style={styles.qrPixels}>
                {Array.from({ length: 36 }, (_, index) => (
                  <View key={index} style={styles.qrPixel} />
                ))}
              </View>
            </View>
          </View>
          <Text style={styles.studentNumber}>Student No. 402410886</Text>
        </View>

        <View style={styles.expiryNote}>
          <Ionicons name="time-outline" size={18} color="#2A52A8" />
          <Text style={styles.expiryText}>
            Expires in <Text style={styles.expiryTime}>02:45:30</Text>
          </Text>
        </View>

        <TouchableOpacity
          accessibilityLabel="Download QR code"
          accessibilityRole="button"
          onPress={() => {}}
          style={styles.downloadButton}
        >
          <Ionicons name="download-outline" size={20} color="#122B63" />
          <Text style={styles.downloadText}>Download QR Code</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function QrMarker({ style }) {
  return (
    <View style={[styles.qrMarker, style]}>
      <View style={styles.qrMarkerInner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1E4A',
  },
  header: {
    height: 58,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#122B63',
  },
  backButton: {
    width: 32,
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pageTitle: {
    width: '100%',
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },
  pageSubtitle: {
    width: '100%',
    color: '#9AA6C4',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 18,
  },
  examCard: {
    width: '100%',
    padding: 14,
    marginBottom: 18,
    backgroundColor: '#122B63',
    borderWidth: 1,
    borderColor: '#1B3C82',
    borderRadius: 12,
  },
  examName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  examDetails: {
    color: '#9AA6C4',
    fontSize: 13,
    marginTop: 5,
  },
  qrCard: {
    width: '100%',
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  qrBox: {
    width: 220,
    height: 220,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2A52A8',
    borderRadius: 14,
    backgroundColor: '#F3F5FA',
  },
  qrPattern: {
    width: 184,
    height: 184,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  qrMarker: {
    width: 45,
    height: 45,
    position: 'absolute',
    zIndex: 2,
    padding: 7,
    backgroundColor: '#0B1E4A',
  },
  qrMarkerInner: {
    flex: 1,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    backgroundColor: '#0B1E4A',
  },
  topLeftMarker: {
    top: 0,
    left: 0,
  },
  topRightMarker: {
    top: 0,
    right: 0,
  },
  bottomLeftMarker: {
    bottom: 0,
    left: 0,
  },
  qrPixels: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'space-around',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
  },
  qrPixel: {
    width: 12,
    height: 12,
    backgroundColor: '#0B1E4A',
  },
  studentNumber: {
    color: '#122B63',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
  },
  expiryNote: {
    width: '100%',
    padding: 13,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E7ECF9',
    borderRadius: 10,
  },
  expiryText: {
    color: '#122B63',
    fontSize: 13,
  },
  expiryTime: {
    fontWeight: '700',
  },
  downloadButton: {
    width: '100%',
    height: 50,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
  },
  downloadText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
