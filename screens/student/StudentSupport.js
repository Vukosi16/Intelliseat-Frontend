import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';

// Later this comes from the backend (the student's reported issues).
// Set it to [] to preview the "no issues" screen.
const ISSUES = [
  {
    id: 'ISS-2026-0142',
    pc: 'PC 24',
    lab: 'Lab 3',
    description: 'Monitor flickers intermittently during the session.',
    status: 'in_progress',
    reportedAt: 'Today, 08:12',
  },
  {
    id: 'ISS-2026-0131',
    pc: 'PC 11',
    lab: 'Lab 1',
    description: 'Keyboard not responding.',
    status: 'resolved',
    reportedAt: '28 Sep, 10:40',
  },
];

// Text and colours for each status
const STATUS_STYLES = {
  open: { label: 'Open', textColor: '#D2232A', backgroundColor: '#FBE4E3' },
  in_progress: { label: 'In progress', textColor: '#B4791E', backgroundColor: '#F6EAD3' },
  resolved: { label: 'Resolved', textColor: '#1D8A55', backgroundColor: '#E1F3E8' },
};

export default function StudentSupport() {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <NavBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Support</Text>
        <Text style={styles.pageSubtitle}>Track the issues you have reported.</Text>

        {/* No issues */}
        {ISSUES.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No issues</Text>
            <Text style={styles.emptyText}>
              You have not reported any issues. If something goes wrong during an assessment, report it from the
              Next Exam page.
            </Text>
          </View>
        )}

        {/* Issue cards */}
        {ISSUES.map((issue) => {
          const status = STATUS_STYLES[issue.status];

          return (
            <View key={issue.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.pcText}>
                  {issue.pc} · {issue.lab}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: status.backgroundColor }]}>
                  <Text style={[styles.statusBadgeText, { color: status.textColor }]}>{status.label}</Text>
                </View>
              </View>

              <Text style={styles.description}>{issue.description}</Text>

              <Text style={styles.meta}>
                {issue.id} · {issue.reportedAt}
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