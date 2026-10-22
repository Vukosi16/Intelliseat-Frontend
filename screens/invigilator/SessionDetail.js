import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DEFAULT_SESSION = {
  name: 'DIT (3rd Year): Networks 731',
  labs: 'Lab 03',
  date: 'Fri, 16 Oct',
  time: '10:00',
  status: 'In progress',
};

export default function SessionDetail({ navigation, route }) {
  const session = route?.params?.session ?? DEFAULT_SESSION;
  const labDetails = session.lab ?? session.labs;
  const sessionForNavigation = { ...session, lab: labDetails };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
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
          onPress={() => navigation.navigate('FullLabMap', { session: sessionForNavigation })}
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
          onPress={() => navigation.navigate('ScanStudent', { session: sessionForNavigation })}
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
});
