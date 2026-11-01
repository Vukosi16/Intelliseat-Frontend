import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';
import { request, unwrapList } from '../../api';

const DEFAULT_SESSION = {
  name: 'DIT (3rd Year): Networks 731',
  lab: 'Lab 03',
  date: 'Fri, 16 Oct',
  time: '10:00',
};

// Default fallback PCs
const DEFAULT_PCS = [
  { number: 1, student: 'Mudanabula D.', status: 'verified' },
  { number: 2, student: 'Bukenya N.', status: 'verified' },
  { number: 3, student: 'Dauds E.', status: 'pending' },
  { number: 4, student: '', status: 'vacant' },
  { number: 5, student: 'Mabena K.', status: 'verified' },
  { number: 6, student: '', status: 'faulty' },
  { number: 7, student: 'Mabaso L.', status: 'verified' },
  { number: 8, student: 'Ndaba M.', status: 'pending' },
  { number: 9, student: 'Thabo J.', status: 'verified' },
  { number: 10, student: '', status: 'vacant' },
  { number: 11, student: 'Koloti O.', status: 'verified' },
  { number: 12, student: 'Mlambo E.', status: 'verified' },
  { number: 13, student: '', status: 'vacant' },
  { number: 14, student: 'Mokoena K.', status: 'verified' },
  { number: 15, student: '', status: 'vacant' },
  { number: 16, student: 'Nkonwana S.', status: 'pending' },
];

// Label and colours for each status
const STATUS_STYLES = {
  verified: { label: 'Verified', textColor: '#1D8A55', backgroundColor: '#E1F3E8' },
  pending: { label: 'Pending', textColor: '#B4791E', backgroundColor: '#F6EAD3' },
  vacant: { label: 'Vacant', textColor: '#6B7280', backgroundColor: '#ECEEF3' },
  faulty: { label: 'Faulty', textColor: '#D2232A', backgroundColor: '#FBE4E3' },
};

export default function LabMap({ navigation, route }) {
  const session = route?.params?.session ?? DEFAULT_SESSION;
  const venueId =
    route?.params?.venueId ||
    session?.venueId?._id ||
    session?.venueId ||
    session?.venue?._id ||
    session?.venue;
  const assessmentId = session?._id || session?.id;

  const [pcs, setPcs] = useState(route?.params?.pcs ?? DEFAULT_PCS);
  const [selectedPc, setSelectedPc] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSeats = useCallback(async () => {
    let endpoint = null;
    if (assessmentId) {
      endpoint = `/api/assessments/${assessmentId}/seats`;
    } else if (venueId) {
      endpoint = `/api/venues/${venueId}/seats`;
    }

    if (!endpoint) return;
    setLoading(true);
    try {
      const data = await request(endpoint);
      const rawSeats = unwrapList(data, 'seats');
      if (rawSeats.length > 0) {
        const mapped = rawSeats.map((s, index) => {
          const rawStatus = (s.status || s.condition || 'vacant').toLowerCase();
          let status = 'vacant';
          if (rawStatus === 'verified' || rawStatus === 'occupied' || rawStatus === 'attended') {
            status = 'verified';
          } else if (rawStatus === 'pending' || rawStatus === 'allocated') {
            status = 'pending';
          } else if (rawStatus === 'faulty' || rawStatus === 'broken' || rawStatus === 'maintenance') {
            status = 'faulty';
          }

          const studentName =
            s.studentName ||
            (s.student ? `${s.student.firstName || ''} ${s.student.lastName || ''}`.trim() : '');

          return {
            id: s._id || s.id || index + 1,
            number: s.number || s.seatNumber || (s.label ? s.label.replace(/[^0-9]/g, '') : index + 1),
            student: status === 'faulty' ? '' : studentName,
            status,
            raw: s,
          };
        });
        setPcs(mapped);
      }
    } catch (err) {
      console.warn('Could not fetch seats from API, keeping existing PCs:', err);
    } finally {
      setLoading(false);
    }
  }, [assessmentId, venueId]);

  useFocusEffect(
    useCallback(() => {
      loadSeats();
      const refreshTimer = setInterval(loadSeats, 15000);
      return () => clearInterval(refreshTimer);
    }, [loadSeats])
  );

  // How many PCs are in each status
  const counts = {
    verified: pcs.filter((pc) => pc.status === 'verified').length,
    pending: pcs.filter((pc) => pc.status === 'pending').length,
    vacant: pcs.filter((pc) => pc.status === 'vacant').length,
    faulty: pcs.filter((pc) => pc.status === 'faulty').length,
  };

  function reportIssueForSelectedPc() {
    const pc = selectedPc;
    setSelectedPc(null);
    navigation.navigate('ReportIssue', {
      session,
      pc: `PC ${pc.number}`,
      seatId: pc.raw?._id,
      venueId: pc.raw?.venueId || venueId,
    });
  }

  function expelSelectedStudent() {
    const pc = selectedPc;
    setSelectedPc(null);
    navigation.navigate('ExpelStudent', {
      session,
      student: {
        _id: pc.raw?.student?._id || pc.raw?.studentId,
        name: pc.student,
        pc: `PC ${pc.number}`,
      },
    });
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
            {session.lab || session.labs || 'Lab'} · {session.date} · {session.time}
          </Text>
        </View>

        <Text style={styles.pageTitle}>Lab Map</Text>
        <Text style={styles.pageSubtitle}>View live seat status. Tap a PC for details.</Text>

        {/* Legend with counts */}
        <View style={styles.legendRow}>
          {Object.keys(STATUS_STYLES).map((key) => (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: STATUS_STYLES[key].textColor }]} />
              <Text style={styles.legendText}>
                {STATUS_STYLES[key].label} ({counts[key] || 0})
              </Text>
            </View>
          ))}
        </View>

        {loading && (
          <ActivityIndicator size="small" color="#FFFFFF" style={{ marginVertical: 12 }} />
        )}

        {/* PC grid */}
        <View style={styles.grid}>
          {pcs.map((pc) => {
            const status = STATUS_STYLES[pc.status] || STATUS_STYLES.vacant;

            return (
              <TouchableOpacity
                key={pc.id || pc.number}
                style={[styles.pcTile, { backgroundColor: status.backgroundColor }]}
                onPress={() => setSelectedPc(pc)}
              >
                <Text style={[styles.pcNumber, { color: status.textColor }]}>PC {pc.number}</Text>
                {pc.student !== '' && (
                  <Text style={[styles.pcStudent, { color: status.textColor }]} numberOfLines={1}>
                    {pc.student}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* PC details popup */}
      <Modal
        visible={selectedPc !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPc(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            {selectedPc && (
              <>
                <Text style={styles.modalTitle}>PC {selectedPc.number}</Text>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: (STATUS_STYLES[selectedPc.status] || STATUS_STYLES.vacant).backgroundColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: (STATUS_STYLES[selectedPc.status] || STATUS_STYLES.vacant).textColor },
                    ]}
                  >
                    {(STATUS_STYLES[selectedPc.status] || STATUS_STYLES.vacant).label}
                  </Text>
                </View>

                <Text style={styles.modalStudent}>
                  {selectedPc.student !== '' ? selectedPc.student : 'No student assigned'}
                </Text>
                {selectedPc.status === 'faulty' && selectedPc.raw?.faultyReason && (
                  <Text style={styles.modalStudent}>Reason: {selectedPc.raw.faultyReason}</Text>
                )}

                {/* Every PC can have an issue reported, even a vacant or faulty one */}
                <TouchableOpacity style={styles.reportButton} onPress={reportIssueForSelectedPc}>
                  <Text style={styles.buttonText}>Report Issue</Text>
                </TouchableOpacity>

                {selectedPc.student !== '' && (
                  <TouchableOpacity style={styles.expelButton} onPress={expelSelectedStudent}>
                    <Text style={styles.buttonText}>Expel Student</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPc(null)}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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

  // Legend
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: 'white',
  },

  // PC grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pcTile: {
    width: '23.5%',
    height: 70,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  pcNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pcStudent: {
    fontSize: 11,
    marginTop: 2,
  },

  // Popup
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalStudent: {
    fontSize: 16,
    color: 'white',
    marginTop: 16,
  },
  reportButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2A52A8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  expelButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#D2232A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  closeButton: {
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