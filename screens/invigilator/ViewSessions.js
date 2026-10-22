import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SESSIONS = [
  {
    id: '1',
    name: 'Bachelor of Science in IT',
    labs: 'Lab 01 & 02',
    date: 'Fri, 16 Oct',
    time: '08:00',
    status: 'Upcoming',
  },
  {
    id: '2',
    name: 'DIT (1st Year)',
    labs: 'Lab 03 & 04',
    date: 'Fri, 16 Oct',
    time: '09:00',
    status: 'Upcoming',
  },
  {
    id: '3',
    name: 'DIT (2nd Year)',
    labs: 'Lab 01 & 02',
    date: 'Fri, 16 Oct',
    time: '13:00',
    status: 'Upcoming',
  },
  {
    id: '4',
    name: 'DIT (3rd Year)',
    labs: 'Lab 03 & 04',
    date: 'Fri, 16 Oct',
    time: '10:00',
    status: 'In progress',
  },
  {
    id: '5',
    name: 'BSc IT (3rd Year) & Articulation',
    labs: 'Lab 05',
    date: 'Mon, 19 Oct',
    time: '08:00',
    status: 'Upcoming',
  },
];

export default function ViewSessions({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back to dashboard"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Sessions</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Assigned sessions</Text>
        <Text style={styles.pageSubtitle}>
          Select a session to view its live lab map and check-in tools.
        </Text>

        {SESSIONS.map((session) => {
          const isCurrentSession = session.status === 'In progress';

          return (
            <TouchableOpacity
              key={session.id}
              accessibilityLabel={`Open ${session.name} session`}
              accessibilityRole="button"
              onPress={() => navigation.navigate('SessionDetail', { session })}
              style={[styles.sessionCard, isCurrentSession && styles.currentSessionCard]}
            >
              <View style={[styles.sessionIcon, isCurrentSession && styles.currentSessionIcon]}>
                <Ionicons
                  name="clipboard-outline"
                  size={22}
                  color={isCurrentSession ? '#FFFFFF' : '#9AA6C4'}
                />
              </View>

              <View style={styles.sessionContent}>
                <View style={styles.sessionHeading}>
                  <Text style={styles.sessionName}>{session.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      isCurrentSession ? styles.inProgressBadge : styles.upcomingBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isCurrentSession ? styles.inProgressText : styles.upcomingText,
                      ]}
                    >
                      {session.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.sessionDetails}>{session.labs}</Text>
                <Text style={styles.sessionSchedule}>
                  {session.date} · {session.time}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#9AA6C4" />
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
  sessionCard: {
    width: '100%',
    minHeight: 92,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#122B63',
    borderWidth: 1,
    borderColor: '#1B3C82',
    borderRadius: 12,
  },
  currentSessionCard: {
    backgroundColor: '#1B3C82',
    borderColor: '#2A52A8',
  },
  sessionIcon: {
    width: 42,
    height: 42,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1E4A',
    borderRadius: 10,
  },
  currentSessionIcon: {
    backgroundColor: '#2A52A8',
  },
  sessionContent: {
    flex: 1,
    marginRight: 8,
  },
  sessionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sessionName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  sessionDetails: {
    color: '#C6CFEC',
    fontSize: 13,
    marginTop: 5,
  },
  sessionSchedule: {
    color: '#9AA6C4',
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  upcomingBadge: {
    backgroundColor: '#3A2C13',
  },
  inProgressBadge: {
    backgroundColor: '#153327',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  upcomingText: {
    color: '#F0C36A',
  },
  inProgressText: {
    color: '#6BD39A',
  },
});