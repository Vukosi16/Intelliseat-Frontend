import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';
import { request, unwrapList } from '../../api';
import { useAuth } from '../../context/AuthContext';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function InvigilatorDashboard({ navigation }) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [openIssues, setOpenIssues] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      request('/api/assessments').catch(() => []),
      request('/api/issues').catch(() => []),
    ])
      .then(([assessmentsData, issuesData]) => {
        setAssessments(unwrapList(assessmentsData, 'assessments'));

        const rawIssues = unwrapList(issuesData, 'issues');
        const unresolved = rawIssues.filter((i) => i.status !== 'resolved').length;
        setOpenIssues(unresolved);
      })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const todaySessions = assessments
    .filter((a) => {
      if (!a.startsAt) return false;
      const d = new Date(a.startsAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    })
    .map((a) => ({
      id: a._id,
      _id: a._id,
      name: a.name,
      type: a.type || 'Type not set',
      lab: a.venueId?.name || a.venueName || 'Lab',
      date: new Date(a.startsAt).toLocaleDateString(),
      time: new Date(a.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: a.status,
      venueId: a.venueId,
      raw: a,
    }));

  const nextSession = todaySessions[0];

  const stats = [
    { label: 'Sessions today', value: todaySessions.length },
    { label: 'Next session', value: nextSession ? nextSession.time : '-' },
    { label: 'Open issues', value: openIssues },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <NavBar alertsScreen="InvigilatorAlerts" profileScreen="InvigilatorProfile" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>
          {getGreeting()}, {user?.firstName || 'Invigilator'}
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

        <TouchableOpacity onPress={() => navigation.navigate('ViewSession')}>
          <Text style={[styles.sectionTitle, { color: '#C6CFEC' }]}>View all assessments ›</Text>
        </TouchableOpacity>

        {/* Today's sessions */}
        <Text style={styles.sectionTitle}>Today's sessions</Text>

        {loading && (
          <ActivityIndicator size="large" color="#FFFFFF" style={{ marginVertical: 20 }} />
        )}

        {!loading && todaySessions.length === 0 && (
          <Text style={styles.emptyText}>You have no sessions today.</Text>
        )}

        {!loading &&
          todaySessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              onPress={() => navigation.navigate('SessionDetail', { session })}
            >
              <View style={styles.sessionText}>
                <Text style={styles.sessionName}>{session.name}</Text>
                <Text style={styles.sessionDetails}>{session.type}</Text>
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