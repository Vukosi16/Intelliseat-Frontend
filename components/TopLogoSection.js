import { View, StyleSheet } from 'react-native';
import IntelliSeatLogo from '../assets/intelliseat_armchair_logo.svg';

export default function TopLogoSection() {
  return (
    <View style={styles.container}>
      <View style={styles.logoSurface}>
        <IntelliSeatLogo width={176} height={72} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
    width: '100%',
  },
  logoSurface: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F5F7FB',
  },
});