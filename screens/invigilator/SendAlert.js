import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { request } from '../../api';

const DEFAULT_SESSION = {
  name: 'DIT (3rd Year): Networks 731',
  lab: 'Lab 03',
  date: 'Fri, 16 Oct',
  time: '10:00',
};

export default function SendAlert({ navigation, route }) {
  const session = route?.params?.session ?? DEFAULT_SESSION;
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const assessmentId = session._id || session.id || session.raw?._id;

  async function handleSend() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setError('Enter a message before sending the alert.');
      return;
    }

    setSending(true);
    setError('');
    try {
      await request('/api/alerts', {
        method: 'POST',
        body: JSON.stringify({
          audienceType: 'assessment',
          assessmentId,
          message: trimmedMessage,
        }),
      });
      setSent(true);
      setMessage('');
    } catch (requestError) {
      setError(requestError.message || 'Failed to send alert.');
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Alert</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sessionCard}>
          <Text style={styles.sessionName}>{session.name}</Text>
          <Text style={styles.sessionDetails}>{session.type || 'Type not set'}</Text>
          <Text style={styles.sessionDetails}>
            {session.lab} · {session.date} · {session.time}
          </Text>
        </View>

        <Text style={styles.pageTitle}>Notify students</Text>
        <Text style={styles.pageSubtitle}>
          Send a manual alert to all students in this session.
        </Text>

        <View style={styles.recipientBox}>
          <Ionicons name="people-outline" size={20} color="#9AA6C4" />
          <View style={styles.recipientContent}>
            <Text style={styles.recipientLabel}>Recipients</Text>
            <Text style={styles.recipientValue}>All students in this session</Text>
          </View>
        </View>

        <Text style={styles.label}>Message</Text>
        <TextInput
          accessibilityLabel="Alert message"
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            setError('');
            setSent(false);
          }}
          style={styles.textArea}
          placeholder="e.g. Please remain seated, an announcement is coming shortly."
          placeholderTextColor="#6B7280"
          multiline
          maxLength={500}
        />
        <Text style={styles.characterCount}>{message.length}/500</Text>

        {error !== '' && <Text style={styles.errorText}>{error}</Text>}
        {sent && (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle-outline" size={19} color="#6BD39A" />
            <Text style={styles.successText}>Alert sent to all students in this session.</Text>
          </View>
        )}

        <TouchableOpacity
          accessibilityLabel="Send alert to students"
          accessibilityRole="button"
          disabled={!message.trim() || sending}
          onPress={handleSend}
          style={[styles.sendButton, (!message.trim() || sending) && styles.disabledButton]}
        >
          <Ionicons name="send-outline" size={19} color="#FFFFFF" />
          <Text style={styles.buttonText}>{sending ? 'Sending…' : 'Send Alert'}</Text>
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
  header: {
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
    padding: 20,
    paddingBottom: 40,
  },
  sessionCard: {
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
  },
  sessionName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  sessionDetails: {
    color: '#9AA6C4',
    fontSize: 14,
    marginTop: 4,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
  },
  pageSubtitle: {
    color: '#9AA6C4',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 20,
  },
  recipientBox: {
    padding: 14,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B3C82',
    borderRadius: 8,
  },
  recipientContent: {
    marginLeft: 10,
  },
  recipientLabel: {
    color: '#9AA6C4',
    fontSize: 12,
  },
  recipientValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 3,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  textArea: {
    height: 140,
    paddingHorizontal: 14,
    paddingTop: 12,
    backgroundColor: '#E7ECF9',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    color: '#141A2E',
    textAlignVertical: 'top',
  },
  characterCount: {
    color: '#9AA6C4',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  errorText: {
    color: '#FF8C86',
    fontSize: 13,
    marginTop: 8,
  },
  successBox: {
    padding: 13,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#153327',
    borderWidth: 1,
    borderColor: '#1D8A55',
    borderRadius: 8,
  },
  successText: {
    flex: 1,
    color: '#6BD39A',
    fontSize: 13,
    marginLeft: 8,
  },
  sendButton: {
    height: 50,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2A52A8',
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
