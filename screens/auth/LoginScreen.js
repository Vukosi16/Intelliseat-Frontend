import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Keyboard,
  LayoutAnimation,
  Platform,
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
  blue500: "#1E3A78",
  blue100: "#E7ECF9",
  red600: "#D2232A",
  red700: "#AE1B21",
  red100: "#FBE4E3",
  white: "#FFFFFF",
  bg: "#FFFFFF",
  card: "#FFFFFF",
  line: "#E1E5F0",
  ink: "#141A2E",
  muted: "#8B93A6",
  gray: "#8B93A6",
  grayBg: "#ECEEF3",
};

// The screen reads everything that differs between a student and an invigilator
const ROLES = {
  student: {
    tab: "Student",
    title: "Ready to begin?",
    subtitle: "Sign in to view your available assessments.",
    idLabel: "Student number",
    idPlaceholder: "e.g. 22501478",
    button: "Continue →",
    notice: "Your assessment activity is securely monitored in line with POPIA",
    home: ROUTES.studentHome,
    buttonColor: "#122B63",
    buttonPressedColor: "#0B1E4A",
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
    buttonColor: "#D2232A",
    buttonPressedColor: "#AE1B21",
  },
};

// The layout moves when the keyboard opens or closes
// In the new position the logo and toogle disappear
// Everything remaining slides up to occupy the space
const LAYOUT_ANIMATION = {
  duration: 180,
  update: { type: LayoutAnimation.Types.easeInEaseOut },
};

export default function LoginScreen({ navigation }) {
  const [role, setRole] = useState("invigilator");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(null);

  const scrollRef = useRef(null);
  const passwordRef = useRef(null);
  const focusedField = useRef(null);
  const formY = useRef(0);
  const fieldY = useRef({ email: 0, password: 0 });

  const wrapRef = useRef(null);
  const [kbOverlap, setKbOverlap] = useState(0);

  // While the keyboard is open the form tightens up
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // Only on very short screens: if it still doesn't fit, the notice box is hidden too.
  const [hideNotice, setHideNotice] = useState(false);
  const contentH = useRef(0);
  const viewH = useRef(0);

  const content = ROLES[role];
  const compact = keyboardVisible;

  //If the content is too tall to fit in inside the visible screen space,
  //hide the notice box so the content can fit without scrolling
  const checkOverflow = () => {
    if (
      compact &&
      !hideNotice &&
      viewH.current > 0 &&
      contentH.current > viewH.current + 1
    ) {
      setHideNotice(true);
    }
  };

  // Safety net for small screens
  const scrollToField = (name) => {
    if (!name) return;
    const maxY = Math.max(contentH.current - viewH.current, 0);
    const y = formY.current + fieldY.current[name] - 16;
    scrollRef.current?.scrollTo({
      y: Math.min(Math.max(y, 0), maxY),
      animated: true,
    });
  };

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const keyboardTop = e.endCoordinates.screenY;
      LayoutAnimation.configureNext(LAYOUT_ANIMATION);
      setKeyboardVisible(true);
      wrapRef.current?.measureInWindow((x, y, w, h) => {
        LayoutAnimation.configureNext(LAYOUT_ANIMATION);
        setKbOverlap(Math.max(y + h - keyboardTop, 0));
      });
      setTimeout(() => scrollToField(focusedField.current), 250);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(LAYOUT_ANIMATION);
      setKeyboardVisible(false);
      setKbOverlap(0);
      setHideNotice(false);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleFocus = (name) => {
    setFocused(name);
    focusedField.current = name;
    setTimeout(() => scrollToField(name), 100);
  };

  const handleBlur = () => {
    setFocused(null);
    focusedField.current = null;
  };

  const handleSignIn = () => {
    Keyboard.dismiss();
    navigation.navigate(content.home);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        ref={wrapRef}
        collapsable={false}
        style={[styles.keyboardAvoid, { paddingBottom: kbOverlap }]}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.contentContainer,
            compact && styles.contentContainerCompact,
          ]}
          onLayout={(e) => {
            viewH.current = e.nativeEvent.layout.height;
            checkOverflow();
          }}
          onContentSizeChange={(w, h) => {
            contentH.current = h;
            checkOverflow();
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          showsVerticalScrollIndicator={false}
        >
          {!compact && <TopLogoSection />}

          <View
            style={[styles.form, compact && styles.formCompact]}
            onLayout={(e) => {
              formY.current = e.nativeEvent.layout.y;
            }}
          >
            {!compact && (
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
                        style={
                          active ? styles.activeTabText : styles.inactiveTabText
                        }
                      >
                        {ROLES[key].tab}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <Text
              style={[
                styles.welcomeTitle,
                compact && styles.welcomeTitleCompact,
              ]}
            >
              {content.title}
            </Text>
            <Text
              style={[
                styles.welcomeSubtitle,
                compact && styles.welcomeSubtitleCompact,
              ]}
            >
              {content.subtitle}
            </Text>

            <View
              style={[styles.formGroup, compact && styles.formGroupCompact]}
              onLayout={(e) => {
                fieldY.current.email = e.nativeEvent.layout.y;
              }}
            >
              <Text style={[styles.label, compact && styles.labelCompact]}>
                {content.idLabel}
              </Text>

              <TextInput
                style={[
                  styles.input,
                  compact && styles.inputCompact,
                  focused === "email"
                    ? styles.inputFocused
                    : styles.inputInactive,
                ]}
                placeholder={content.idPlaceholder}
                placeholderTextColor={COLORS.gray}
                value={email}
                onChangeText={setEmail}
                onFocus={() => handleFocus("email")}
                onBlur={handleBlur}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="username"
                textContentType="username"
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            <View
              style={[styles.formGroup, compact && styles.formGroupCompact]}
              onLayout={(e) => {
                fieldY.current.password = e.nativeEvent.layout.y;
              }}
            >
              <Text style={[styles.label, compact && styles.labelCompact]}>
                Password
              </Text>

              <TextInput
                ref={passwordRef}
                style={[
                  styles.input,
                  compact && styles.inputCompact,
                  focused === "password"
                    ? styles.inputFocused
                    : styles.inputInactive,
                ]}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.gray}
                value={password}
                onChangeText={setPassword}
                onFocus={() => handleFocus("password")}
                onBlur={handleBlur}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.forgotPasswordButton,
                compact && styles.forgotPasswordButtonCompact,
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => navigation.navigate(ROUTES.forgotPassword)}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                compact && styles.submitButtonCompact,
                { backgroundColor: content.buttonColor },
                pressed && { backgroundColor: content.buttonPressedColor },
              ]}
              onPress={handleSignIn}
            >
              <Text style={styles.submitButtonText}>{content.button}</Text>
            </Pressable>

            {!(compact && hideNotice) && (
              <View
                style={[
                  styles.noticeContainer,
                  compact && styles.noticeContainerCompact,
                ]}
              >
                <Text style={styles.noticeText}>{content.notice}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  keyboardAvoid: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  contentContainerCompact: {
    paddingBottom: 8,
  },
  form: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  // While typing, start from the top instead of centring
  formCompact: {
    justifyContent: "flex-start",
    paddingTop: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
    marginBottom: 35,
  },
  toggleContainerCompact: {
    marginBottom: 12,
  },

  activeTab: {
    flex: 1,
    backgroundColor: COLORS.blue800,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: "700",
  },

  inactiveTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  inactiveTabText: {
    color: COLORS.muted,
    fontWeight: "500",
  },
  tabCompact: {
    paddingVertical: 7,
  },
  welcomeTitle: {
    color: COLORS.ink,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
  },
  welcomeTitleCompact: {
    marginBottom: 6,
  },
  welcomeSubtitleCompact: {
    marginBottom: 14,
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
  formGroupCompact: {
    marginBottom: 8,
  },
  label: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  labelCompact: {
    marginBottom: 4,
  },
  input: {
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  inputCompact: {
    height: 42,
  },
  inputInactive: {
    backgroundColor: COLORS.blue800,
    borderColor: COLORS.line,
    borderWidth: 1,
    color: COLORS.white,
  },
  inputFocused: {
    backgroundColor: COLORS.blue500,
    borderColor: COLORS.red600,
    borderWidth: 1.5,
    color: COLORS.white,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotPasswordButtonCompact: {
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: COLORS.blue600,
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  submitButtonCompact: {
    height: 46,
    marginBottom: 12,
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
    paddingHorizontal: 16,
    alignItems: "center",
  },
  noticeContainerCompact: {
    paddingVertical: 8,
  },
  noticeText: {
    color: COLORS.muted,
    fontSize: 13,
  },
});
