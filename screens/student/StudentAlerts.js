import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';
import { request, unwrapList } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function StudentAlerts() {
  const { user } = useAuth();
  const isInvigilator = user?.role && user.role !== 'student';
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertError, setAlertError] = useState('');

  useEffect(() => {
    request('/api/alerts')
      .then((data) => {
        const list = unwrapList(data, 'alerts');
        const mapped = list.map((a) => ({
          id: a._id || a.id || Math.random().toString(),
          _id: a._id,
          title: a.title || (a.senderId?.role
            ? a.senderId.role.charAt(0).toUpperCase() + a.senderId.role.slice(1)
            : a.kind === 'manual' ? 'Admin' : 'Notice'),
          sender: a.sender || (a.senderId?.role
            ? a.senderId.role.charAt(0).toUpperCase() + a.senderId.role.slice(1)
            : 'Admin'),
          time: a.createdAt
            ? new Date(a.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
            : 'Recently',
          message: a.message || '',
          read: !!a.read,
          kind: a.kind,
        }));
        setAlerts(mapped);
      })
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, []);

  // Open the full message and mark the alert as read
  async function openAlert(alert) {
    setAlertError('');
    setSelectedAlert(alert);
    if (alert.read || !alert._id) return;

    try {
      await request(`/api/alerts/${alert._id}/read`, { method: 'POST' });
      setAlerts((current) => current.map((item) => (
        item.id === alert.id ? { ...item, read: true } : item
      )));
      DeviceEventEmitter.emit('intelliseat:alerts-updated');
    } catch (error) {
      setAlertError(error.message || 'Could not save this alert as read.');
    }
  }

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <NavBar
        alertsScreen={isInvigilator ? 'InvigilatorAlerts' : 'StudentAlert'}
        profileScreen={isInvigilator ? 'InvigilatorProfile' : 'StudentProfile'}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Alerts</Text>
        <Text style={styles.pageSubtitle}>
          {unreadCount > 0 ? `You have ${unreadCount} unread alerts.` : 'You are all caught up.'}
        </Text>

        {loading && (
          <ActivityIndicator size="large" color="#FFFFFF" style={{ marginVertical: 30 }} />
        )}

        {!loading && alerts.length === 0 && <Text style={styles.emptyText}>No alerts yet.</Text>}

        {!loading &&
          alerts.map((alert) => (
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
                {alertError !== '' && <Text style={styles.errorText}>{alertError}</Text>}
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
  errorText: {
    color: '#FF8C86',
    fontSize: 13,
    marginTop: 12,
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