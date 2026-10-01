// TopLogoSection.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Palette = {
  rfBlue800: '#122B63',
  ink: '#141A2E',
  rfRed600: '#D2232A',
  white: '#FFFFFF',
};

export default function TopLogoSection() {
  return (
    <View style={styles.container}>
      {/* Icon Square with Rounded Corners */}
      <View style={styles.logoMark}>
        <Text style={styles.logoMarkText}>I</Text>
      </View>

      {/* Brand Text */}
      <Text style={styles.logoText}>
        Intelli<Text style={styles.accent}>Seat</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    backgroundColor: 'transparent', // Blends seamlessly on any background color
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Palette.rfBlue800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: {
    color: Palette.white,
    fontSize: 20,
    fontWeight: '800',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: Palette.ink, // White text on dark screen, or Palette.ink on light screen
  },
  accent: {
    color: Palette.rfRed600,
  },
});