import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

// Import custom TopLogoSection component
import TopLogoSection from '../../components/TopLogoSection';

// Brand Design System Palette
const Palette = {
  rfBlue900: '#0B1E4A',
  rfBlue800: '#122B63',
  rfBlue700: '#1B3C82',
  rfBlue600: '#2A52A8',
  rfBlue100: '#E7ECF9',
  rfRed600: '#D2232A',
  rfRed700: '#AE1B21',
  rfRed100: '#FBE4E3',
  white: '#FFFFFF',
  bg: '#F3F5FA',
  card: '#FFFFFF',
  line: '#E1E5F0',
  ink: '#141A2E',
  muted: '#6B7280',
  green: '#1D8A55',
  greenBg: '#E1F3E8',
  amber: '#B4791E',
  amberBg: '#F6EAD3',
  gray: '#8B93A6',
  grayBg: '#ECEEF3',
};

export default function ForgotPassword() {
  const [currentScreen, setCurrentScreen] = useState('FORGOT');

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [timer, setTimer] = useState(272);

  useEffect(() => {
    let interval;
    if (currentScreen === 'OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentScreen, timer]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.cardWrapper}>
            {/* Custom Top Logo Component */}
            <TopLogoSection />

            {/* SCREEN: FORGOT PASSWORD */}
            {currentScreen === 'FORGOT' && (
              <>
                <Text style={styles.hScreen}>Reset your password</Text>
                <Text style={styles.sub}>Enter your registered email address to continue.</Text>

                <View style={styles.noteBox}>
                  <Text style={styles.noteBoxText}>
                    We'll send a one-time code to your registered email address.
                  </Text>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Email address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="name@richfield.ac.za"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <TouchableOpacity
                  style={styles.btn}
                  activeOpacity={0.8}
                  onPress={() => setCurrentScreen('OTP')}
                >
                  <Text style={styles.btnText}>Send reset code →</Text>
                </TouchableOpacity>

                <View style={styles.centerLinkRow}>
                  <TouchableOpacity onPress={() => alert('Navigate to login')}>
                    <Text style={styles.link}>← Back to login</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* SCREEN: OTP VERIFICATION */}
            {currentScreen === 'OTP' && (
              <>
                <Text style={styles.hScreen}>Enter verification code</Text>
                <Text style={styles.sub}>We sent a 6-digit code to your registered email.</Text>

                <View style={styles.field}>
                  <Text style={styles.label}>One-time code</Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="· · · · · ·"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                  />
                </View>

                <View style={[styles.noteBox, styles.otpTimerRow]}>
                  <Text style={styles.noteBoxText}>Code expires in</Text>
                  <Text style={styles.timerText}>{formatTimer(timer)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.btn}
                  activeOpacity={0.8}
                  onPress={() => setCurrentScreen('NEWPASS')}
                >
                  <Text style={styles.btnText}>Verify code →</Text>
                </TouchableOpacity>

                <View style={styles.centerLinkRow}>
                  <TouchableOpacity onPress={() => setTimer(272)}>
                    <Text style={styles.link}>Resend code</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* SCREEN: NEW PASSWORD */}
            {currentScreen === 'NEWPASS' && (
              <>
                <Text style={styles.hScreen}>Create new password</Text>
                <Text style={styles.sub}>Please create a new password and confirm it below.</Text>

                <View style={styles.field}>
                  <Text style={styles.label}>New password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Confirm new password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.btn, styles.btnRed]}
                  activeOpacity={0.8}
                  onPress={() => alert('Password updated!')}
                >
                  <Text style={styles.btnText}>Submit</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.bg,
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Palette.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: Palette.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  hScreen: {
    fontSize: 21,
    fontWeight: '700',
    color: Palette.ink,
    marginBottom: 6,
    marginTop: 12,
  },
  sub: {
    fontSize: 13,
    color: Palette.muted,
    marginBottom: 22,
    lineHeight: 19.5,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.muted,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    fontSize: 14,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: Palette.rfBlue700,
    borderRadius: 10,
    backgroundColor: Palette.rfBlue800,
    color: Palette.white,
  },
  otpInput: {
    letterSpacing: 8,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  noteBox: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: Palette.rfBlue100,
    marginBottom: 18,
  },
  noteBoxText: {
    fontSize: 12.5,
    color: Palette.rfBlue800,
    lineHeight: 18.75,
  },
  otpTimerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerText: {
    fontWeight: '700',
    color: Palette.rfBlue800,
    fontSize: 12.5,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.rfBlue800,
    backgroundColor: Palette.rfBlue800,
  },
  btnRed: {
    backgroundColor: Palette.rfRed600,
    borderColor: Palette.rfRed600,
  },
  btnText: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '600',
  },
  centerLinkRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  link: {
    color: Palette.rfBlue600,
    fontSize: 13,
    fontWeight: '600',
  },
});

