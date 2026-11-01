import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopLogoSection from '../../components/TopLogoSection';
import { Palette } from './ForgotPassword';
import { request } from '../../api';
import { useAuth } from '../../context/AuthContext';
 
export default function NewPasswordScreen({ navigation, route }) {
  const setupToken = route?.params?.setupToken || '';
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function updatePassword() {
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Use at least 8 characters with a letter and a number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await request('/api/auth/set-password', {
        method: 'POST',
        body: JSON.stringify({ setupToken, password }),
      });
      await login(result.user, result.token);
    } catch (requestError) {
      if (/expired|invalid.*token/i.test(requestError.message || '')) {
        navigation.navigate('OTPVerification', { purpose: route?.params?.purpose || 'invite' });
        return;
      }
      setError(requestError.message || 'Could not update password.');
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <SafeAreaView style={styles.keyboardContainer} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <StatusBar barStyle="light-content" />
 
          <View style={styles.logoWrapper}>
            <TopLogoSection />
          </View>
 
          <View>
            <Text style={styles.hScreen}>Create a new password</Text>
            <Text style={styles.sub}>
              Choose a strong password for your IntelliSeat account.
            </Text>
 
            <View style={styles.noteBox}>
              <Text style={styles.noteBoxText}>
                Use at least 8 characters with a mix of letters and numbers.
              </Text>
            </View>
 
            <View style={styles.field}>
              <Text style={styles.label}>New password</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'password' && styles.inputFocus,
                ]}
                placeholder="Enter new password"
                placeholderTextColor={Palette.muted}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
 
            <View style={styles.field}>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'confirm' && styles.inputFocus,
                ]}
                placeholder="Re-enter new password"
                placeholderTextColor={Palette.muted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
 
            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity style={styles.btn} activeOpacity={0.8} onPress={updatePassword} disabled={loading}>
              <Text style={styles.btnText}>{loading ? 'Updating…' : 'Update password →'}</Text>
            </TouchableOpacity>
 
            <TouchableOpacity style={styles.linkContainer} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>← Back to login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  // scrollContainer: {
  //   flexGrow: 1,
  //   justifyContent: 'center',
  //   paddingHorizontal: 20,
  //   paddingTop: 80,
  //   paddingBottom: 120,
  // },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  logoWrapper: {
    position: 'absolute',
    top: 30,
    left: 0,
    zIndex: 10,
  },
  hScreen: {
    fontFamily: 'Poppins',
    fontSize: 22,
    fontWeight: '700',
    color: Palette.white,
    marginBottom: 6,
  },
  sub: {
    fontSize: 13,
    color: Palette.muted,
    marginBottom: 22,
    lineHeight: 19.5,
  },
  noteBox: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: Palette.noteBg,
    marginBottom: 18,
  },
  noteBoxText: {
    fontSize: 12.5,
    color: Palette.noteText,
    lineHeight: 18.75,
    fontWeight: '500',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.white,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: Palette.inputBorder,
    borderRadius: 10,
    backgroundColor: Palette.inputBg,
    color: '#000000',
  },
  inputFocus: {
    borderColor: Palette.link,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Palette.btnBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: Palette.bg,
  },
  btnText: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '600',
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 18,
  },
  link: {
    color: Palette.link,
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF8C86',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
});
 
