import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// The student pages use the defaults. Invigilator pages pass their own screen names.
export default function NavBar({ alertsScreen = 'StudentAlert', profileScreen = 'StudentProfile' }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/tempLogo.png')} style={styles.logo} />
      </View>

      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={() => navigation.navigate(alertsScreen)}>
          <Ionicons name="notifications-outline" size={35} color="gold" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate(profileScreen)}>
          <Ionicons name="person-circle-outline" size={40} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 70,
    backgroundColor: '#0B1E4A',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#122B63',
  },
  logoContainer: {},
  leftContainer: {
    flexDirection: 'row',
    gap: 15,
    paddingRight: 20,
  },
  logo: {
    width: 150,
    height: 50,
  },
});