import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { request, unwrapList } from '../../api';

const DEFAULT_SESSION = {
  name: 'DIT (3rd Year): Networks 731',
  labs: 'Lab 03',
  date: 'Fri, 16 Oct',
  time: '10:00',
  status: 'In progress',
};

export default function SessionDetail({ navigation, route }) {
  const session = route?.params?.session ?? DEFAULT_SESSION;
  const labDetails = session.lab ?? session.labs ?? 'Lab';
  const sessionId = session._id || session.id;
  const sessionForNavigation = { ...session, lab: labDetails };

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [issuesLoading, setIssuesLoading] = useState(Boolean(sessionId));
  const [issuesError, setIssuesError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    request(`/api/assessments/${sessionId}/students`)
      .then((data) => {
        setStudents(unwrapList(data, 'students'));
      })
      .catch((err) => {
        console.warn('Could not fetch students for assessment:', err);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  const loadSessionIssues = useCallback(async () => {
    if (!sessionId) {
      setIssues([]);
      setIssuesLoading(false);
      return;
    }
    setIssuesLoading(true);
    setIssuesError('');
    try {
      const result = await request(`/api/issues?assessmentId=${encodeURIComponent(sessionId)}`);
      setIssues(unwrapList(result, 'issues'));
    } catch (error) {
      setIssuesError(error.message || 'Could not load issues for this session.');
    } finally {
      setIssuesLoading(false);
    }
  }, [sessionId]);

  useFocusEffect(
    useCallback(() => {
      loadSessionIssues();
      const refreshTimer = setInterval(loadSessionIssues, 15000);
      return () => clearInterval(refreshTimer);
    }, [loadSessionIssues])
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back to sessions"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sessionCard}>
          <View style={styles.sessionHeading}>
            <Text style={styles.sessionName}>{session.name}</Text>
            {session.status && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{session.status}</Text>
              </View>
            )}
          </View>
          <Text style={styles.sessionDetails}>{session.type || 'Type not set'}</Text>
          <Text style={styles.sessionDetails}>
            {labDetails} · {session.date} · {session.time}
          </Text>
        </View>

        <Text style={styles.pageTitle}>Session tools</Text>
        <Text style={styles.pageSubtitle}>
          Monitor this assessment and manage student check-ins.
        </Text>

        <TouchableOpacity
          accessibilityLabel="Show lab map"
          accessibilityRole="button"
          onPress={() =>
            navigation.navigate('FullLabMap', {
              session: sessionForNavigation,
              venueId: session.venueId?._id || session.venueId || session.venue?._id || session.venue,
            })
          }
          style={styles.actionCard}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="map-outline" size={23} color="#9AA6C4" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Show Lab Map</Text>
            <Text style={styles.actionSubtitle}>View live seat status</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9AA6C4" />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Scan student QR code"
          accessibilityRole="button"
          onPress={() =>
            navigation.navigate('ScanStudent', {
              session: sessionForNavigation,
              assessment: session.raw || session,
            })
          }
          style={[styles.actionCard, styles.primaryActionCard]}
        >
          <View style={[styles.actionIcon, styles.primaryActionIcon]}>
            <Ionicons name="qr-code-outline" size={23} color="#FFFFFF" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Scan Student QR Code</Text>
            <Text style={styles.actionSubtitle}>Verify and check in a student</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C6CFEC" />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Send a session alert"
          accessibilityRole="button"
          onPress={() => navigation.navigate('SendAlert', { session: sessionForNavigation })}
          style={styles.actionCard}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="notifications-outline" size={23} color="#9AA6C4" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Send Alert</Text>
            <Text style={styles.actionSubtitle}>Notify students in this session</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9AA6C4" />
        </TouchableOpacity>

        <View style={styles.issuesHeading}>
          <View style={styles.issuesHeadingText}>
            <Text style={[styles.pageTitle, styles.issuesTitle]}>
              Session issues {issues.length > 0 && `(${issues.length})`}
            </Text>
            <Text style={styles.issuesSubtitle}>Open and in-progress reports for this assessment.</Text>
          </View>
          <TouchableOpacity
            accessibilityLabel="Refresh session issues"
            accessibilityRole="button"
            onPress={loadSessionIssues}
            disabled={issuesLoading}
            style={styles.refreshButton}
          >
            <Ionicons name="refresh-outline" size={20} color="#C6CFEC" />
          </TouchableOpacity>
        </View>

        {issuesLoading && (
          <ActivityIndicator size="small" color="#FFFFFF" style={{ marginVertical: 12 }} />
        )}
        {!!issuesError && <Text style={styles.issuesError}>{issuesError}</Text>}
        {!issuesLoading && !issuesError && issues.length === 0 && (
          <Text style={styles.emptyText}>No pending issues have been reported for this session.</Text>
        )}
        {!issuesLoading && issues.map((issue) => {
          const reporter = issue.reporterId || {};
          const reporterName = [reporter.firstName, reporter.lastName].filter(Boolean).join(' ')
            || reporter.email
            || 'Unknown reporter';
          const seat = issue.seatId?.label || (issue.seatId?.number ? `PC ${issue.seatId.number}` : '');
          const venue = issue.venueId?.name || labDetails;
          const statusLabel = issue.status === 'in_progress' ? 'In progress' : 'Open';
          const reporterId = reporter._id || (typeof issue.reporterId === 'string' ? issue.reporterId : null);
          const studentAllocation = reporterId
            ? students.find((allocation) => {
              const allocationStudentId = allocation.studentId?._id || allocation.studentId;
              return String(allocationStudentId) === String(reporterId);
            })
            : null;
          const studentRecord = studentAllocation?.studentId && typeof studentAllocation.studentId === 'object'
            ? studentAllocation.studentId
            : reporter;
          const allocationSeat = studentAllocation?.seatId && typeof studentAllocation.seatId === 'object'
            ? studentAllocation.seatId
            : {};
          const isStudentReporter = reporter.role === 'student' || Boolean(studentRecord.studentNumber);
          return (
            <TouchableOpacity
              key={issue._id}
              accessibilityRole={isStudentReporter ? 'button' : undefined}
              accessibilityLabel={isStudentReporter ? `Open ${reporterName}'s student page for this issue` : undefined}
              disabled={!isStudentReporter}
              activeOpacity={isStudentReporter ? 0.75 : 1}
              onPress={() => navigation.navigate('StudentProfileInv', {
                session: sessionForNavigation,
                student: {
                  _id: reporterId,
                  name: reporterName,
                  studentNumber: studentRecord.studentNumber || '—',
                  pc: allocationSeat.label
                    || (allocationSeat.number ? `PC ${allocationSeat.number}` : '')
                    || seat
                    || 'Unassigned',
                  seat: Object.keys(allocationSeat).length ? allocationSeat : issue.seatId || {},
                  eligibility: studentRecord.eligibility || 'Eligible',
                  verified: Boolean(studentAllocation?.verifiedAt || studentAllocation?.status === 'verified'),
                  verifiedAt: studentAllocation?.verifiedAt || null,
                },
                issue: {
                  _id: issue._id,
                  category: issue.category,
                  description: issue.description,
                  status: issue.status,
                  createdAt: issue.createdAt,
                  seatId: issue.seatId,
                  venueId: issue.venueId,
                },
              })}
              style={[styles.issueCard, isStudentReporter && styles.issueCardPressable]}
            >
              <View style={styles.issueCardHeader}>
                <Text style={styles.issueCategory}>{String(issue.category || 'other').replace(/_/g, ' ')}</Text>
                <View style={styles.issueHeaderRight}>
                  <View style={styles.issueStatusBadge}>
                    <Text style={styles.issueStatusText}>{statusLabel}</Text>
                  </View>
                  {isStudentReporter && <Ionicons name="chevron-forward" size={18} color="#9AA6C4" />}
                </View>
              </View>
              <Text style={styles.issueDescription}>{issue.description}</Text>
              <Text style={styles.issueMeta}>
                {reporterName} · {[venue, seat].filter(Boolean).join(' · ')}
              </Text>
              {issue.createdAt && (
                <Text style={styles.issueTime}>{new Date(issue.createdAt).toLocaleString()}</Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Student list section */}
        <Text style={[styles.pageTitle, { marginTop: 24, fontSize: 20 }]}>
          Enrolled Students {students.length > 0 && `(${students.length})`}
        </Text>

        {loading && (
          <ActivityIndicator size="small" color="#FFFFFF" style={{ marginVertical: 16 }} />
        )}

        {!loading && students.length === 0 && (
          <Text style={styles.emptyText}>No students enrolled for this session yet.</Text>
        )}

        {!loading &&
          students.map((allocation, idx) => {
            const studentRecord = allocation.studentId && typeof allocation.studentId === 'object'
              ? allocation.studentId
              : allocation.student && typeof allocation.student === 'object'
                ? allocation.student
                : {};
            const seatRecord = allocation.seatId && typeof allocation.seatId === 'object'
              ? allocation.seatId
              : allocation.seat && typeof allocation.seat === 'object'
                ? allocation.seat
                : {};
            const studentId = studentRecord._id
              || (typeof allocation.studentId === 'string' ? allocation.studentId : null)
              || studentRecord.id
              || allocation.userId
              || allocation._id
              || allocation.id;
            const studentName =
              allocation.name ||
              studentRecord.name ||
              `${studentRecord.firstName || allocation.firstName || ''} ${studentRecord.lastName || allocation.lastName || ''}`.trim() ||
              `Student ${idx + 1}`;
            const studentNum = studentRecord.studentNumber || allocation.studentNumber || '—';
            const pcNumber = seatRecord.label
              || (seatRecord.number ? `PC ${seatRecord.number}` : '')
              || allocation.seatNumber
              || allocation.pc
              || 'Unassigned';
            const isCheckedIn = Boolean(
              allocation.verifiedAt
              || allocation.attended
              || allocation.checkedIn
              || allocation.status === 'verified'
              || allocation.status === 'checked_in'
            );

            return (
              <TouchableOpacity
                key={allocation._id || allocation.id || studentId || idx}
                style={styles.studentCard}
                onPress={() =>
                  navigation.navigate('StudentProfileInv', {
                    session: sessionForNavigation,
                    student: {
                      _id: studentId,
                      allocationId: allocation._id || allocation.id,
                      name: studentName,
                      studentNumber: studentNum,
                      pc: pcNumber,
                      seat: seatRecord,
                      verified: isCheckedIn,
                      verifiedAt: allocation.verifiedAt || null,
                      eligibility: studentRecord.eligibility || allocation.eligibility || 'Eligible',
                    },
                  })
                }
              >
                <View style={styles.studentInfo}>
                  <Text style={styles.studentCardName}>{studentName}</Text>
                  <Text style={styles.studentCardSub}>
                    {studentNum} · {pcNumber}
                  </Text>
                </View>
                <View
                  style={[
                    styles.studentBadge,
                    isCheckedIn ? styles.checkedInBadge : styles.notCheckedBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.studentBadgeText,
                      isCheckedIn ? styles.checkedInText : styles.notCheckedText,
                    ]}
                  >
                    {isCheckedIn ? 'Checked in' : 'Pending'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0B1E4A',
  },
  header: {
    width: '100%',
    height: 64,
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
    width: '100%',
    padding: 20,
    paddingBottom: 40,
  },
  sessionCard: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#1B3C82',
    borderWidth: 1,
    borderColor: '#2A52A8',
    borderRadius: 12,
  },
  sessionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sessionName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  sessionDetails: {
    color: '#C6CFEC',
    fontSize: 14,
    marginTop: 7,
  },
  statusBadge: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#153327',
    borderRadius: 10,
  },
  statusText: {
    color: '#6BD39A',
    fontSize: 10,
    fontWeight: '700',
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '700',
  },
  pageSubtitle: {
    color: '#9AA6C4',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 20,
  },
  issuesHeading: {
    marginTop: 20,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  issuesHeadingText: {
    flex: 1,
  },
  issuesTitle: {
    fontSize: 20,
  },
  issuesSubtitle: {
    color: '#9AA6C4',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#122B63',
    borderRadius: 10,
  },
  issuesError: {
    color: '#FFB7B7',
    fontSize: 13,
    marginVertical: 10,
  },
  issueCard: {
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#122B63',
    borderWidth: 1,
    borderColor: '#1B3C82',
    borderRadius: 10,
  },
  issueCardPressable: {
    borderColor: '#2A52A8',
  },
  issueCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  issueHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  issueCategory: {
    color: '#C6CFEC',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  issueStatusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: '#3A2C13',
    borderRadius: 8,
  },
  issueStatusText: {
    color: '#F0C36A',
    fontSize: 11,
    fontWeight: '700',
  },
  issueDescription: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 9,
  },
  issueMeta: {
    color: '#9AA6C4',
    fontSize: 12,
    marginTop: 8,
  },
  issueTime: {
    color: '#7486B2',
    fontSize: 11,
    marginTop: 4,
  },
  actionCard: {
    minHeight: 76,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122B63',
    borderWidth: 1,
    borderColor: '#1B3C82',
    borderRadius: 12,
  },
  primaryActionCard: {
    backgroundColor: '#1B3C82',
    borderColor: '#2A52A8',
  },
  actionIcon: {
    width: 42,
    height: 42,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1E4A',
    borderRadius: 10,
  },
  primaryActionIcon: {
    backgroundColor: '#2A52A8',
  },
  actionContent: {
    flex: 1,
    marginRight: 8,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionSubtitle: {
    color: '#9AA6C4',
    fontSize: 13,
    marginTop: 5,
  },
  emptyText: {
    color: '#9AA6C4',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
  },
  studentCard: {
    backgroundColor: '#122B63',
    borderWidth: 1,
    borderColor: '#1B3C82',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentInfo: {
    flex: 1,
  },
  studentCardName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  studentCardSub: {
    color: '#9AA6C4',
    fontSize: 13,
    marginTop: 3,
  },
  studentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  checkedInBadge: {
    backgroundColor: '#153327',
  },
  notCheckedBadge: {
    backgroundColor: '#3A2C13',
  },
  studentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  checkedInText: {
    color: '#6BD39A',
  },
  notCheckedText: {
    color: '#F0C36A',
  },
});
