import NavBar from '../../components/NavBar';
import  Calendar  from '../../components/Calendar'; 
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';


export default function StudentDashboard() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <NavBar />
      
      <View style={styles.mainTextContainer}>
        <Text style={styles.mainHeading}>
          Welcome back, Thabo
        </Text>
        
        <Text style={styles.subHeading}>
          Here is your upcoming assessment, seat allocation and attendance at a glance.
        </Text>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar />
      </View>

      <View style={styles.upcomingAssessmentsContainer}>
        
        <View style={styles.upcomingAssessmentsComponent}>
          <View style={styles.upcomingAssessmentsComponentHeadingContainer}>
            
            <View style={styles.testNameContainer}>
              <Text style={styles.testName}>
                Test Name
              </Text>
              
              <Text style={styles.testType}>
                Test Type
              </Text>
            </View>
            
            <View style={styles.testArrival}>
              <Text style={styles.testArrivalTime}>
                Upcoming
              </Text>
            </View>
          
          </View>

          <View style={styles.upcomingAssessmentsComponentAssessmentDetailsContainer}>
            <View style={styles.gridBox}>
              <Text style={styles.infoType}>Date</Text>
              <Text style={styles.infoText}>5 Oct 2026</Text>
            </View>

            <View style={styles.gridBox}>
              <Text style={styles.infoType}>Time</Text>
              <Text style={styles.infoText}>08:00 - 10:00</Text>
            </View>

            <View style={styles.gridBox}>
              <Text style={styles.infoType}>Lab</Text>
              <Text style={styles.infoText}>Lab 1</Text>
            </View>

            <View style={styles.gridBox}>
              <Text style={styles.infoType}>Status</Text>
              <Text style={styles.infoStatus}>Eligible</Text>
            </View>
          </View>

          <View style={styles.enterExamButtonContainer}>
            <TouchableOpacity 
              style={styles.enterExamButton}
              onPress={() => {
                navigation.navigate('NextExam');
              }}  
            >
              <Text style={styles.enterExamButtonText}>
                Enter Exam
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,
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
    textAlign: 'left ',
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
  paddingLeft: 6
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
    borderRadius: 5,
    backgroundColor: 'orange',
    padding: 5,
    width: 100,
    borderRadius: 5,
    backgroundColor: 'green',
    color: 'white',
    textAlign: 'center',
    width: 75,
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
  enterExamButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  }

});