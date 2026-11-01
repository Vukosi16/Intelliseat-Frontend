import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';
import { request, unwrapList } from '../../api';

// Text and colours for each status
const STATUS_STYLES = {
  open: { label: 'Open', textColor: '#D2232A', backgroundColor: '#FBE4E3' },
  in_progress: { label: 'In progress', textColor: '#B4791E', backgroundColor: '#F6EAD3' },
  resolved: { label: 'Resolved', textColor: '#1D8A55', backgroundColor: '#E1F3E8' },
};

function mapIssue(issue, fallbackDescription = '') {
  const seat = issue.seatId && typeof issue.seatId === 'object' ? issue.seatId : {};
  const venue = issue.venueId && typeof issue.venueId === 'object' ? issue.venueId : {};
  const seatLabel = seat.label
    || (seat.number ? `PC ${seat.number}` : '')
    || (typeof issue.pc === 'string' ? issue.pc : '')
    || 'Seat unavailable';
  const venueName = venue.name
    || (typeof issue.venue === 'string' ? issue.venue : '')
    || issue.venueName
    || seat.venueId?.name
    || 'Venue unavailable';

  return {
    id: issue._id || issue.id || `${Date.now()}-${Math.random()}`,
    pc: seatLabel,
    lab: venueName,
    description: issue.description || fallbackDescription,
    status: (issue.status || 'open').toLowerCase(),
    reportedAt: issue.createdAt
      ? new Date(issue.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
      : 'Just now',
  };
}

export default function StudentSupport({ route }) {
  const [isCreatingIssue, setIsCreatingIssue] = useState(route?.params?.openNewIssue ?? false);
  const [issueText, setIssueText] = useState('');
  const [submittedIssue, setSubmittedIssue] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request('/api/issues')
      .then((data) => {
        const list = unwrapList(data, 'issues');
        setIssues(list.map((item) => mapIssue(item)));
      })
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, []);

  async function submitIssue() {
    const description = issueText.trim();
    if (!description) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = {
        category: 'other',
        description,
      };
      if (route?.params?.assessmentId) {
        payload.assessmentId = route.params.assessmentId;
      }
      const created = await request('/api/issues', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const newIssueItem = mapIssue(created, description);

      setSubmittedIssue(newIssueItem);
      setIssues((prev) => [newIssueItem, ...prev]);
      setIssueText('');
      setIsCreatingIssue(false);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <NavBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Support</Text>
        <Text style={styles.pageSubtitle}>Track reported issues or create a new support request.</Text>

        <TouchableOpacity
          accessibilityLabel="Create a new support issue"
          accessibilityRole="button"
          onPress={() => {
            setIsCreatingIssue((isOpen) => !isOpen);
            setSubmitError('');
          }}
          style={styles.newIssueButton}
        >
          <Text style={styles.newIssueButtonText}>
            {isCreatingIssue ? 'Cancel new issue' : 'Report a new issue'}
          </Text>
        </TouchableOpacity>

        {isCreatingIssue && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New support issue</Text>
            <Text style={styles.formLabel}>Describe the issue</Text>
            <TextInput
              accessibilityLabel="Issue description"
              value={issueText}
              onChangeText={setIssueText}
              style={styles.textArea}
              placeholder="e.g. PC not working, login problem..."
              placeholderTextColor="#9AA6C4"
              multiline
              maxLength={500}
            />

            {!!submitError && (
              <Text style={styles.errorText}>{submitError}</Text>
            )}

            <TouchableOpacity
              accessibilityLabel="Submit support issue"
              accessibilityRole="button"
              disabled={!issueText.trim() || submitting}
              onPress={submitIssue}
              style={[
                styles.submitButton,
                (!issueText.trim() || submitting) && styles.disabledButton,
              ]}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting…' : 'Submit issue'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {submittedIssue && (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Issue submitted</Text>
            <Text style={styles.successText}>Your support issue has been added to the list below.</Text>
          </View>
        )}

        {loading && (
          <ActivityIndicator size="large" color="#FFFFFF" style={{ marginVertical: 20 }} />
        )}

        {/* No issues */}
        {!loading && issues.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No issues</Text>
            <Text style={styles.emptyText}>
              You have not reported any issues. If something goes wrong during an assessment, report it from the
              Next Exam page.
            </Text>
          </View>
        )}

        {/* Issue cards */}
        {!loading &&
          issues.map((issue) => {
            const status = STATUS_STYLES[issue.status] || STATUS_STYLES.open;

            return (
              <View key={issue.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.pcText}>
                    {issue.pc} · {issue.lab}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.backgroundColor }]}>
                    <Text style={[styles.statusBadgeText, { color: status.textColor }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.description}>{issue.description}</Text>

                <Text style={styles.meta}>
                  Reported {issue.reportedAt}
                </Text>
              </View>
            );
          })}
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
  newIssueButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D2232A',
    borderRadius: 8,
    marginBottom: 14,
  },
  newIssueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    padding: 16,
    marginBottom: 14,
  },
  formTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  formLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  textArea: {
    minHeight: 100,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    textAlignVertical: 'top',
    backgroundColor: '#0B1E4A',
    borderWidth: 1,
    borderColor: '#1B3C82',
    borderRadius: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginTop: 8,
  },
  submitButton: {
    height: 46,
    marginTop: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A52A8',
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  successBox: {
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#153327',
    borderWidth: 1,
    borderColor: '#1D8A55',
    borderRadius: 8,
  },
  successTitle: {
    color: '#6BD39A',
    fontSize: 15,
    fontWeight: '700',
  },
  successText: {
    color: '#C6CFEC',
    fontSize: 13,
    marginTop: 4,
  },

  // Issue card
  card: {
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pcText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15,
    color: 'white',
    marginTop: 12,
    lineHeight: 22,
  },
  meta: {
    fontSize: 12,
    color: '#9AA6C4',
    marginTop: 12,
  },

  // No issues
  emptyBox: {
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyText: {
    fontSize: 14,
    color: '#9AA6C4',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});