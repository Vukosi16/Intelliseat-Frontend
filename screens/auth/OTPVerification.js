import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import TopLogoSection from '../../components/TopLogoSection';
import { request } from '../../api';

export default function OTPVerification({ navigation, route }) {
    const purpose = route?.params?.purpose || 'invite';
    const [email, setEmail] = useState(route?.params?.email || '');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    async function verifyCode() {
      if (!email.trim() || !/^\d{6}$/.test(code.trim())) {
        setError('Enter the code sent to your email.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        const result = await request('/api/auth/verify-code', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim(), purpose }),
        });
        navigation.navigate('NewPassword', { setupToken: result.setupToken });
      } catch (requestError) {
        setError(requestError.message || 'Invalid or expired code.');
      } finally {
        setLoading(false);
      }
    }

    async function resendCode() {
      if (resending) return;
      setError('');
      setResending(true);
      try {
        await request(purpose === 'invite' ? '/api/auth/resend-code' : '/api/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
      } catch (requestError) {
        setError(requestError.message || 'Could not resend the code.');
      } finally {
        setResending(false);
      }
    }

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
                value={email}
                onChangeText={setEmail}
                style={styles.pinInput}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
            />
            
            <TextInput 
                value={code}
                onChangeText={setCode}
                style={styles.pinInput}
                placeholder="Enter 6 digit code"
                keyboardType="number-pad"
                maxLength={6}
            />
            
        </View>

        <View style={styles.codeAuthenticationContainer}>

            {!!error && <Text style={{ color: '#FF8C86', paddingTop: 8 }}>{error}</Text>}

            <TouchableOpacity style={styles.codeVerificationButton} onPress={verifyCode} disabled={loading}>
                <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>
                    {loading ? 'Verifying…' : 'Verify Code'}
                </Text>
            </TouchableOpacity>

            <Text style={{fontSize: 13, fontWeight: 'regular', color: '#6B7280', paddingTop: 10}}>
                Didn't receive the code?
            </Text>
            
            <TouchableOpacity onPress={resendCode} disabled={resending}>
                <Text style={{ color: '#3B82F6', paddingTop: 10 }}>
                  {resending ? 'Sending…' : 'Resend Code'}
                </Text>
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