import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';

// Later this comes from the backend. For now it is hardcoded so the screen can be previewed.
const STARTING_ALERTS = [
  {
    id: '1',
    title: 'Lab 3 entrance opens early',
    sender: 'Admin',
    time: 'Today, 07:20',
    message:
      'Lab 3 will open 15 minutes early today due to expected high volume. Please arrive on time to avoid the queue and have your QR code ready.',
    read: false,
  },
  {
    id: '2',
    title: 'Eligibility confirmed',
    sender: 'System',
    time: 'Yesterday, 14:02',
    message:
      'Your eligibility status for Database Systems (5 Oct) has been confirmed as Eligible. Your seat and QR code are ready.',
    read: false,
  },
  {
    id: '3',
    title: 'Seat allocation ready',
    sender: 'System',
    time: '2 Oct, 09:15',
    message: 'You have been allocated PC 24 in Lab 3 for Database Systems.',
    read: true,
  },
];

export default function StudentAlerts() {
  const [alerts, setAlerts] = useState(STARTING_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Open the full message and mark the alert as read
  function openAlert(alert) {
    setSelectedAlert(alert);
    setAlerts(alerts.map((a) => (a.id === alert.id ? { ...a, read: true } : a)));
  }

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
<SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>      <NavBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Alerts</Text>
        <Text style={styles.pageSubtitle}>
          {unreadCount > 0 ? `You have ${unreadCount} unread alerts.` : 'You are all caught up.'}
        </Text>

        {alerts.length === 0 && <Text style={styles.emptyText}>No alerts yet.</Text>}

        {alerts.map((alert) => (
          <TouchableOpacity key={alert.id} style={styles.pod} onPress={() => openAlert(alert)}>
            <View style={styles.podHeader}>
              <Text style={styles.podTitle}>{alert.title}</Text>
              {!alert.read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.podPreview} numberOfLines={1}>
              {alert.message}
            </Text>
            <Text style={styles.podMeta}>
              {alert.time} · {alert.sender}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Full message popup */}
      <Modal
        visible={selectedAlert !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAlert(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            {selectedAlert && (
              <>
                <Text style={styles.modalTitle}>{selectedAlert.title}</Text>
                <Text style={styles.podMeta}>
                  {selectedAlert.time} · {selectedAlert.sender}
                </Text>
                <Text style={styles.modalMessage}>{selectedAlert.message}</Text>
              </>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedAlert(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
  emptyText: {
    fontSize: 15,
    color: '#9AA6C4',
    textAlign: 'center',
    marginTop: 40,
  },

  // Alert pods
  pod: {
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  podHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  podTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D2232A',
    marginLeft: 10,
  },
  podPreview: {
    fontSize: 14,
    color: '#9AA6C4',
    marginTop: 6,
  },
  podMeta: {
    fontSize: 12,
    color: '#9AA6C4',
    marginTop: 8,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalMessage: {
    fontSize: 16,
    color: 'white',
    marginTop: 16,
    lineHeight: 24,
  },
  closeButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2A52A8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});