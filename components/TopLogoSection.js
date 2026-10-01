import { View, Text, Image ,StyleSheet } from 'react-native';

export default function TopLogoSection() {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/tempLogo.png')} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    justifyContent: 'center',
    height: '10%',
    width: '100%',
},
});