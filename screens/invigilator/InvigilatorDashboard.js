import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';

// Later this comes from the backend (today's exams assigned to this invigilator).
const INVIGILATOR_FIRST_NAME = 'Radebe';
const OPEN_ISSUES = 1;
const SESSIONS = [
  { id: '1', name: 'DIT (3rd Year): Networks 731', lab: 'Lab 03', date: 'Fri, 16 Oct', time: '10:00' },
  { id: '2', name: 'DIT (2nd Year): Databases 621', lab: 'Lab 01', date: 'Fri, 16 Oct', time: '13:00' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function InvigilatorDashboard({ navigation }) {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const nextSession = SESSIONS[0];

  // The three small boxes at the top
  const stats = [
    { label: 'Sessions today', value: SESSIONS.length },
    { label: 'Next session', value: nextSession ? nextSession.time : '-' },
    { label: 'Open issues', value: OPEN_ISSUES },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <NavBar alertsScreen="SendAlert" profileScreen="StudentProfileInv" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>
          {getGreeting()}, {INVIGILATOR_FIRST_NAME}
        </Text>
        <Text style={styles.pageSubtitle}>{today}</Text>

        {/* Stat boxes */}
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statBox}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Today's sessions */}
        <Text style={styles.sectionTitle}>Today's sessions</Text>

        {SESSIONS.length === 0 && <Text style={styles.emptyText}>You have no sessions today.</Text>}

        {SESSIONS.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={styles.sessionCard}
            onPress={() => navigation.navigate('SessionDetail', { session })}
          >
            <View style={styles.sessionText}>
              <Text style={styles.sessionName}>{session.name}</Text>
              <Text style={styles.sessionDetails}>
                {session.lab} · Starts at {session.time}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#9AA6C4',
    textAlign: 'center',
    marginTop: 20,
  },

  // Stat boxes
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '31%',
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: '#9AA6C4',
    marginTop: 4,
  },

  // Session cards
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  sessionText: {
    flex: 1,
  },
  sessionName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  sessionDetails: {
    fontSize: 14,
    color: '#9AA6C4',
    marginTop: 4,
  },
  chevron: {
    fontSize: 30,
    color: '#9AA6C4',
    marginLeft: 10,
  },
});