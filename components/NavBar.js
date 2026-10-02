import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NavBar() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require('../assets/tempLogo.png')} style={styles.logo} />
      </View>
      <View style={styles.leftContainer}>
        <Ionicons name="notifications-outline" size={35} color="gold" />
        <Ionicons name="person-circle-outline" size={40} color="white" />
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    width: '100%',
    height: '12%',
    backgroundColor: '#0B1E4A',
    alignItems: 'center', 
    justifyContent: 'space-between', 
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#122B63',
  },
  logoContainer: {
   

  },leftContainer: {
    flexDirection: 'row',
    gap: 15,
    paddingRight: 20,
  },logo: {
    width: 150,
    height: 50,
  }
});