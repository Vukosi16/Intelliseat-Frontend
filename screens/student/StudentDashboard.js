import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import NavBar from '../../components/NavBar';
import Calendar from '../../components/Calendar';
import { request, unwrapList } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, refreshUser } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      refreshUser().catch((error) => console.warn('Could not refresh student eligibility:', error));

      if (!user?.course || !Number.isInteger(user.year)) {
        setAssessments([]);
        setLoading(false);
        return () => {
          active = false;
        };
      }

      request('/api/assessments')
        .then((data) => {
          if (!active) return;
          const studentAssessments = unwrapList(data, 'assessments').filter(
            (assessment) => Number(assessment.qualificationYear) === Number(user.year)
          );
          setAssessments(studentAssessments);
        })
        .catch((error) => {
          if (active) console.warn('Could not refresh assessments:', error);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
      };
    }, [refreshUser, user?.course, user?.year])
  );

  const upcoming = assessments
    .filter(a => a.status === 'upcoming' || a.status === 'in_progress')
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));

  const next = upcoming[0] ?? null;
  const eligibilityApproved = user?.eligibility === 'eligible';
  const eligibilityStatus = eligibilityApproved ? 'Eligible' : 'Needs review';

  const formatStatus = (status) => String(status || '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return '—';
    }
  };

  const formatTime = (startsAt, endsAt) => {
    if (!startsAt) return '—';
    try {
      const start = new Date(startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (!endsAt) return start;
      const end = new Date(endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${start} - ${end}`;
    } catch {
      return '—';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <NavBar />
      
      <View style={styles.mainTextContainer}>
        <Text style={styles.mainHeading}>
          {`Welcome back, ${user?.firstName || 'Student'}`}
        </Text>
        
        <Text style={styles.subHeading}>
          Here is your upcoming assessment, seat allocation and attendance at a glance.
        </Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar dates={assessments.map((a) => a.startsAt || a.date)} />
      </View>

      <View style={styles.upcomingAssessmentsContainer}>
        <View style={styles.upcomingAssessmentsComponent}>
          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" style={{ flex: 1, alignSelf: 'center' }} />
          ) : next ? (
            <>
              <View style={styles.upcomingAssessmentsComponentHeadingContainer}>
                <View style={styles.testNameContainer}>
                  <Text style={styles.testName}>{next.name}</Text>
                  
                  <Text style={styles.testType}>
                    {next.type || 'Type not set'}
                  </Text>
                </View>
                
                <View style={styles.testArrival}>
                  <Text style={styles.testArrivalTime}>
                    {formatStatus(next.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.upcomingAssessmentsComponentAssessmentDetailsContainer}>
                <View style={styles.gridBox}>
                  <Text style={styles.infoType}>Date</Text>
                  <Text style={styles.infoText}>{formatDate(next.startsAt)}</Text>
                </View>

                <View style={styles.gridBox}>
                  <Text style={styles.infoType}>Time</Text>
                  <Text style={styles.infoText}>{formatTime(next.startsAt, next.endsAt)}</Text>
                </View>

                <View style={styles.gridBox}>
                  <Text style={styles.infoType}>Lab</Text>
                  <Text style={styles.infoText}>{next.venueId?.name ?? next.venueName ?? '—'}</Text>
                </View>

                <View style={styles.gridBox}>
                  <Text style={styles.infoType}>Eligibility</Text>
                  <Text style={styles.infoStatus}>{eligibilityStatus}</Text>
                </View>
              </View>

              <View style={styles.enterExamButtonContainer}>
                <TouchableOpacity 
                  style={[styles.enterExamButton, !eligibilityApproved && styles.enterExamButtonDisabled]}
                  disabled={!next || !eligibilityApproved}
                  accessibilityState={{ disabled: !next || !eligibilityApproved }}
                  onPress={() => {
                    if (!next || !eligibilityApproved) return;
                    navigation.navigate('NextExam', { assessment: next });
                  }}  
                >
                  <Text style={styles.enterExamButtonText}>
                    {eligibilityApproved ? 'Enter Exam' : 'Eligibility Needs Review'}
                  </Text>
                </TouchableOpacity>
              </View>
              {!eligibilityApproved && (
                <Text style={styles.eligibilityNotice}>
                  Your assessment eligibility needs review. Please visit the admin.
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.emptyAssessments}>No upcoming assessments.</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0B1E4A',
  },
  mainTextContainer: {
    width: '100%',
    height: '17%',
    justifyContent: 'center',
  }, 
  mainHeading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
    paddingLeft: 15,
    paddingBottom: 7,
  },
  subHeading: {
    textAlign: 'left',
    paddingLeft: 15,
    color: '#6B7280',
  },
  calendarContainer: {
    width: '100%',
    height: '30%',
    alignItems: 'center',
  },
  upcomingAssessmentsContainer: {
    width: '100%',
    height: '40%',
    alignItems: 'center',
  },
  upcomingAssessmentsComponent: {
    width: '95%',
    height: '90%',
    backgroundColor: '#122B63',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderRadius: 20,
    padding: 10,
    gap: 5,
  },
  emptyAssessments: {
    color: '#D1D5DB',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  upcomingAssessmentsComponentHeadingContainer: {
    width: '100%',
    height: '25%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  upcomingAssessmentsComponentAssessmentDetailsContainer: {
    width: '100%',
    height: '50%',
    borderRadius: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    padding: 10,
  },
  gridBox: {
    width: '48%',
    height: '48%',
    borderRadius: 8,
    justifyContent: 'center',
    paddingLeft: 6,
  },
  infoType: {
    fontSize: 15,
    color: '#6B7280',
  },
  infoText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  infoStatus: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: 'green',
    color: 'white',
    textAlign: 'center',
    width: 75,
  },
  testNameContainer: {
    flex: 1,
  },
  testName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    paddingLeft: 5,
  },
  testType: {
    fontSize: 15,
    color: '#6B7280',
    paddingLeft: 5,
  },
  testArrival: {
    borderRadius: 5,
    backgroundColor: 'orange',
    padding: 5,
    marginRight: 25,
  },
  testArrivalTime: {
    color: 'white',
    fontWeight: 'bold',
  },
  enterExamButtonContainer: {
    width: '100%',
    height: '23%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enterExamButton: {
    width: '90%',
    height: '80%',
    backgroundColor: '#0B1E4A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enterExamButtonDisabled: {
    opacity: 0.55,
  },
  eligibilityNotice: {
    width: '90%',
    marginTop: 4,
    marginBottom: 12,
    color: '#FFD18A',
    fontSize: 13,
    textAlign: 'center',
  },
  enterExamButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});