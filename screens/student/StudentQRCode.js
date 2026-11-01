import { useEffect, useRef, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import TopLogoSection from '../../components/TopLogoSection';
import { request } from '../../api';
import { useAuth } from '../../context/AuthContext';

const REFRESH_EVERY_MS = 90_000; // refresh 30 s before the 120-s TTL

export default function StudentQRCode({ navigation, route }) {
  const { user } = useAuth();
  const assessment = route?.params?.assessment ?? route?.params?.exam ?? {};
  const assessmentId = assessment._id || assessment.id;

  const [token, setToken] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [attendanceVerified, setAttendanceVerified] = useState(false);
  const [verifiedBy, setVerifiedBy] = useState('');

  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const fetchToken = useCallback(async () => {
    if (!assessmentId || !user?._id || attendanceVerified) return;
    setLoading(true);
    setError('');
    try {
      const data = await request(`/api/students/${user._id}/qr?assessmentId=${assessmentId}`);
      setToken(data.token);
      setExpiresAt(new Date(data.expiresAt));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [assessmentId, attendanceVerified, user?._id]);

  const checkVerification = useCallback(async () => {
    if (!assessmentId) return;
    try {
      const attendance = await request(`/api/assessments/${assessmentId}/attendance`);
      setAttendanceVerified(Boolean(attendance?.verified));
      setVerifiedBy(attendance?.verifiedBy || '');
      setVerificationError('');
    } catch (requestError) {
      setVerificationError(requestError.message || 'Could not check verification status.');
    }
  }, [assessmentId]);

  useEffect(() => {
    fetchToken();
    if (!attendanceVerified) timerRef.current = setInterval(fetchToken, REFRESH_EVERY_MS);
    return () => clearInterval(timerRef.current);
  }, [attendanceVerified, fetchToken]);

  useFocusEffect(
    useCallback(() => {
      checkVerification();
      const verificationTimer = setInterval(checkVerification, 5000);
      return () => clearInterval(verificationTimer);
    }, [checkVerification])
  );

  // Countdown display
  useEffect(() => {
    if (!expiresAt) return;
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      const left = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [expiresAt]);

  const formatCountdown = (s) => {
    if (s === null) return '—';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <TopLogoSection />
      <View style={styles.header}>
        <TouchableOpacity hitSlop={10} onPress={() => navigation.goBack()} style={styles.backButton}>
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
        {attendanceVerified && (
          <View style={styles.verifiedNotice} accessibilityLiveRegion="polite">
            <Ionicons name="checkmark-circle" size={20} color="#B9F2D5" />
            <Text style={styles.verifiedNoticeText}>
              Verified by invigilator{verifiedBy ? ` ${verifiedBy}` : ''}.
            </Text>
          </View>
        )}
        {!!verificationError && (
          <Text style={styles.verificationError}>{verificationError}</Text>
        )}

        {assessment.name && (
          <View style={styles.examCard}>
            <Text style={styles.examName}>{assessment.name}</Text>
            <Text style={styles.examDetails}>{assessment.type || 'Type not set'}</Text>
            <Text style={styles.examDetails}>
              {assessment.date || (assessment.startsAt ? new Date(assessment.startsAt).toLocaleDateString() : '')} · {assessment.startTime || (assessment.startsAt ? new Date(assessment.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '')} · {assessment.venueName || assessment.venueId?.name || assessment.lab || ''}
            </Text>
          </View>
        )}

        <View style={styles.qrCard}>
          {loading && <ActivityIndicator size="large" color="#122B63" style={{ height: 220 }} />}
          {!loading && error && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#D2232A', textAlign: 'center' }}>{error}</Text>
              <TouchableOpacity onPress={fetchToken} style={styles.retryButton}>
                <Text style={{ color: '#122B63', fontWeight: '700' }}>Try again</Text>
              </TouchableOpacity>
            </View>
          )}
          {!loading && token && (
            <>
              <QRCode
                value={token}
                size={220}
                color="#0B1E4A"
                backgroundColor="#FFFFFF"
              />
              <Text style={styles.studentNumber}>Student No. {user?.studentNumber}</Text>
            </>
          )}
        </View>

        {secondsLeft !== null && (
          <View style={styles.expiryNote}>
            <Ionicons name="time-outline" size={18} color="#2A52A8" />
            <Text style={styles.expiryText}>
              Expires in <Text style={styles.expiryTime}>{formatCountdown(secondsLeft)}</Text>
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1E4A' },
  header: { height: 58, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#122B63' },
  backButton: { width: 32, alignItems: 'flex-start' },
  headerTitle: { flex: 1, color: '#FFFFFF', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  headerSpacer: { width: 32 },
  scrollContent: { padding: 20, paddingBottom: 40, alignItems: 'center' },
  pageTitle: { width: '100%', color: '#FFFFFF', fontSize: 26, fontWeight: '700' },
  pageSubtitle: { width: '100%', color: '#9AA6C4', fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 18 },
  verifiedNotice: { width: '100%', padding: 12, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#123F38', borderWidth: 1, borderColor: '#45B883', borderRadius: 10 },
  verifiedNoticeText: { color: '#B9F2D5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  verificationError: { width: '100%', marginBottom: 12, color: '#FFB7B7', fontSize: 12, textAlign: 'center' },
  examCard: { width: '100%', padding: 14, marginBottom: 18, backgroundColor: '#122B63', borderWidth: 1, borderColor: '#1B3C82', borderRadius: 12 },
  examName: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  examDetails: { color: '#9AA6C4', fontSize: 13, marginTop: 5 },
  qrCard: { width: '100%', padding: 18, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, minHeight: 260, justifyContent: 'center' },
  studentNumber: { color: '#122B63', fontSize: 12, fontWeight: '600', marginTop: 12 },
  expiryNote: { width: '100%', padding: 13, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#E7ECF9', borderRadius: 10 },
  expiryText: { color: '#122B63', fontSize: 13 },
  expiryTime: { fontWeight: '700' },
  retryButton: { marginTop: 12, padding: 10 },
});
