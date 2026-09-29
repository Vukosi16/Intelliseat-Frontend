import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import TopLogoSection from '../../components/TopLogoSection';
import { Link } from '@react-navigation/native';

export default function OTPVerification() {
    const [code, setCode] = useState('');
  return (
    <SafeAreaView style={styles.container}>
      
      <TopLogoSection />
        
        <View style={styles.verificationTextContainer}>
            <Text style={{fontSize: 30, fontWeight: 'bold', color: 'white', textAlign: 'left' }}>Enter verification code</Text>
            <Text style={{fontSize: 15, fontWeight: 'regular', paddingTop: 10, color: '#6B7280'}}>We sent a 6-digit code to your registered email.</Text>
        </View>
        
        <View style={styles.codeContainer}>
            
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white' }}>
                One-time code
            </Text>
            
            <TextInput 
                value={code}
                onChangeText={setCode}
                style={styles.pinInput}
                placeholder="Enter 6 digit code"
                keyboardType="number-pad"
                maxLength={6}
            />
            
            <View style={styles.expiryCodeTextContainer}>
                <Text style={{fontSize: 13, fontWeight: 'regular', color: '#6B7280'}}>
                    Code expires in 00:59
                </Text>
            </View>

        </View>

        <View style={styles.codeAuthenticationContainer}>

            <TouchableOpacity style={styles.codeVerificationButton} >
                <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>
                    Verify Code
                </Text>
            </TouchableOpacity>

            <Text style={{fontSize: 13, fontWeight: 'regular', color: '#6B7280', paddingTop: 10}}>
                Didn't receive the code?
            </Text>
            
            <TouchableOpacity >
                <Text style={{ color: '#3B82F6', paddingTop: 10 }}>Resend Code</Text>
            </TouchableOpacity>

        </View>

    

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    backgroundColor: '#0B1E4A',
  },
  verificationTextContainer: {
    width: '100%',
    height: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeContainer: {
    width: '100%',
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  pinInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#122B63', 
    borderRadius: 8, 
    paddingHorizontal: 20,
    backgroundColor: '#E7ECF9',
    color: '#000000',
    marginTop: 10,
    width: '90%'
  },
  expiryCodeTextContainer: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#122B63', 
    borderRadius: 8, 
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    marginTop: 10,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  codeAuthenticationContainer: {
    width: '100%',
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeVerificationButton: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#0B1E4A', 
    borderRadius: 8, 
    paddingHorizontal: 20,
    backgroundColor: '#122B63',
    color: '#000000',
    marginTop: 10,
    width: '90%',
    justifyContent: 'center', 
    alignItems: 'center'
  }
});