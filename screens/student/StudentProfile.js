import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../../components/NavBar';

// Later this comes from the logged-in student's record in the backend.
const STUDENT = {
  firstName: 'Evril',
  lastName: 'Nemakhavhani',
  studentNumber: '402410886',
  email: 'evril@richfield.ac.za',
  course: 'Diploma in Information Technology',
  year: 'Year 2',
  eligibility: 'Eligible',
};

export default function StudentProfile({ navigation }) {
  const initials = STUDENT.firstName[0] + STUDENT.lastName[0];

  // Each row in the details card
  const details = [
    { label: 'Student number', value: STUDENT.studentNumber },
    { label: 'Email', value: STUDENT.email },
    { label: 'Course', value: STUDENT.course },
    { label: 'Year of study', value: STUDENT.year },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <NavBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Avatar and name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>
            {STUDENT.firstName} {STUDENT.lastName}
          </Text>
          <View style={styles.eligibleBadge}>
            <Text style={styles.eligibleBadgeText}>{STUDENT.eligibility}</Text>
          </View>
        </View>

        {/* Details card */}
        <View style={styles.card}>
          {details.map((item, index) => (
            <View key={item.label} style={[styles.row, index === details.length - 1 && styles.lastRow]}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.helpText}>
          Something wrong? Student details can only be changed by the administrator.
        </Text>

        {/* Log out */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Log out</Text>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2A52A8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 14,
  },
  eligibleBadge: {
    backgroundColor: '#E1F3E8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
  },
  eligibleBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1D8A55',
  },

  // Details card
  card: {
    backgroundColor: '#122B63',
    borderWidth: 1.5,
    borderColor: '#1B3C82',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1B3C82',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 13,
    color: '#9AA6C4',
  },
  rowValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 2,
  },
  helpText: {
    fontSize: 13,
    color: '#9AA6C4',
    textAlign: 'center',
    marginTop: 16,
  },

  // Log out
  logoutButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#D2232A',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});