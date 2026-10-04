import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import TopLogoSection from "../../components/TopLogoSection";

const ROUTES = {
  forgotPassword: "ForgotPassword",
  studentHome: "StudentDashboard",
  invigilatorHome: "InvigilatorDashboard",
};

const COLORS = {
  blue900: "#0B1E4A",
  blue800: "#122B63",
  blue700: "#1B3C82",
  blue600: "#2A52A8",
  blue100: "#E7ECF9",
  red600: "#D2232A",
  red700: "#AE1B21",
  red100: "#FBE4E3",
  white: "#FFFFFF",
  bg: "#F3F5FA",
  card: "#FFFFFF",
  line: "#E1E5F0",
  ink: "#141A2E",
  muted: "#6B7280",
  gray: "#8B93A6",
  grayBg: "#ECEEF3",
};

const ROLES = {
  student: {
    tab: "Student",
    title: "Ready to begin?",
    subtitle: "Sign in to view your available assessments.",
    idLabel: "Student number",
    idPlaceholder: "e.g. 402111555",
    button: "Continue →",
    notice: "Your assessment activity is securely monitored in line with POPIA",
    home: ROUTES.studentHome,
  },
  invigilator: {
    tab: "Invigilator",
    title: "Welcome, Invigilator",
    subtitle: "Sign in to open the assessment monitoring tools.",
    idLabel: "Staff number or email",
    idPlaceholder: "Enter your staff details",
    notice: "Authorised institutional access only.",
    button: "Open Console →",
    home: ROUTES.invigilatorHome,
  },
};

export default function LoginScreen({ navigation }) {
  const [role, setRole] = useState("invigilator");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(null);

  const content = ROLES[role];

  const handleSignIn = () => {
    navigation.navigate(content.home);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopLogoSection />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toggleContainer}>
          {Object.keys(ROLES).map((key) => {
            const active = role === key;
            return (
              <TouchableOpacity
                key={key}
                style={active ? styles.activeTab : styles.inactiveTab}
                onPress={() => setRole(key)}
              >
                <Text
                  style={active ? styles.activeTabText : styles.inactiveTabText}
                >
                  {ROLES[key].tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.welcomeTitle}>{content.title}</Text>
        <Text style={styles.welcomeSubtitle}>{content.subtitle}</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{content.idLabel}</Text>
          <TextInput
            style={[styles.input, focused === "email" && styles.inputFocused]}
            placeholder={content.idPlaceholder}
            placeholderTextColor={COLORS.muted}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[
              styles.input,
              focused === "password" && styles.inputFocused,
            ]}
            placeholder="Enter your password"
            placeholderTextColor={COLORS.muted}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
            secureTextEntry={true}
          />
        </View>

        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={() => navigation.navigate(ROUTES.forgotPassword)}
        >
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
          ]}
          onPress={handleSignIn}
        >
          <Text style={styles.submitButtonText}>{content.button}</Text>
        </Pressable>

        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>{content.notice}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.grayBg,
    borderRadius: 8,
    padding: 4,
    marginBottom: 35,
  },
  activeTab: {
    flex: 1,
    backgroundColor: COLORS.blue100,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.blue700,
  },
  activeTabText: {
    color: COLORS.blue900,
    fontWeight: "600",
  },
  inactiveTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveTabText: {
    color: COLORS.muted,
    fontWeight: "500",
  },
  welcomeTitle: {
    color: COLORS.ink,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: COLORS.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 16,
    color: COLORS.ink,
    fontSize: 15,
  },
  inputFocused: {
    borderColor: COLORS.blue600,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: COLORS.blue600,
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: COLORS.red600,
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  submitButtonPressed: {
    backgroundColor: COLORS.red700,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  noticeContainer: {
    backgroundColor: COLORS.grayBg,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  noticeText: {
    color: COLORS.muted,
    fontSize: 13,
  },
});
