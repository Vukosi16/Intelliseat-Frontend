import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, } from 'react-native';
import TopLogoSection from '../../components/TopLogoSection';

export const Palette = {
  bg: '#0B1E4A',          // Canvas outer background
  noteBg: '#E7ECF9',      // Info banner background
  noteText: '#0B1E4A',    // Banner text color
  inputBg: '#E7ECF9',     // Input field background
  inputBorder: '#122B63', // Input field border
  btnBg: '#122B63',       // Primary button background
  white: '#FFFFFF',
  muted: '#6B7280',       // Muted gray text
  link: '#3B82F6',        // Link color
};

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('name@richfield.ac.za');
  const [isFocused, setIsFocused] = useState(false);

  return (
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

          {/* Top Right Anchored Logo */}
          <View style={styles.logoWrapper}>
            <TopLogoSection />
          </View>

          {/* Main Content Card */}
          <View style={styles.card}>
            <Text style={styles.hScreen}>Reset your password</Text>
            <Text style={styles.sub}>
              Enter your registered email address to continue.
            </Text>

            {/* Note Box */}
            <View style={styles.noteBox}>
              <Text style={styles.noteBoxText}>
                We'll send a one-time code to your registered email address.
              </Text>
            </View>

            {/* Input Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={[
                  styles.input,
                  isFocused && styles.inputFocus,
                ]}
                placeholder="studentnumber@my.richfield.ac.za"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Action Button */}
            <TouchableOpacity style={styles.btn} activeOpacity={0.8}>
              <Text style={styles.btnText}>Send reset code →</Text>
            </TouchableOpacity>

            {/* Back Link */}
            <TouchableOpacity style={styles.linkContainer}>
              <Text style={styles.link}>← Back to login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: Palette.bg,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 80, // Leaves space below status bar & top-right logo
    paddingBottom: 120,
  },
  logoWrapper: {
    position: 'absolute',
    top: 30,            // Positions near top below status bar
    left: 0,          // Anchors strictly to the left
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
});