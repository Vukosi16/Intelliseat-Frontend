import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import NetworkStatusBanner from './components/NetworkStatusBanner';

import LoginScreen from './screens/auth/LoginScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPassword';
import OTPVerificationScreen from './screens/auth/OTPVerification';
import NewPasswordScreen from './screens/auth/NewPassword';

import StudentDashboard from './screens/student/StudentDashboard';
import NextExam from './screens/student/NextExam';
import StudentAlert from './screens/student/StudentAlerts';
import StudentProfile from './screens/student/StudentProfile';
import StudentQRCode from './screens/student/StudentQRCode';
import StudentSupport from './screens/student/StudentSupport';

import InvigilatorDashboard from './screens/invigilator/InvigilatorDashboard';
import ExpelStudent from './screens/invigilator/ExpelStudent';
import FullLabMap from './screens/invigilator/FullLabMap';
import ReportIssue from './screens/invigilator/ReportAnIssue';
import ScanStudent from './screens/invigilator/ScanStudent';
import SendAlert from './screens/invigilator/SendAlert';
import SessionDetail from './screens/invigilator/SessionDetail';
import StudentProfileInv from './screens/invigilator/StudentProfile';
import ViewSession from './screens/invigilator/ViewSessions';
import InvigilatorProfile from './screens/invigilator/InvigilatorProfile';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, restoring } = useAuth();

  if (restoring) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#1e4f91" />
      </View>
    );
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
      </Stack.Navigator>
    );
  }

  if (user.role === 'student') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="StudentDashboard">
        <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
        <Stack.Screen name="NextExam" component={NextExam} />
        <Stack.Screen name="StudentAlert" component={StudentAlert} />
        <Stack.Screen name="StudentProfile" component={StudentProfile} />
        <Stack.Screen name="StudentQRCode" component={StudentQRCode} />
        <Stack.Screen name="StudentSupport" component={StudentSupport} />
      </Stack.Navigator>
    );
  }

  // invigilator (and admin fallback)
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="InvigilatorDashboard">
      <Stack.Screen name="InvigilatorDashboard" component={InvigilatorDashboard} />
      <Stack.Screen name="ViewSession" component={ViewSession} />
      <Stack.Screen name="SessionDetail" component={SessionDetail} />
      <Stack.Screen name="ScanStudent" component={ScanStudent} />
      <Stack.Screen name="StudentProfileInv" component={StudentProfileInv} />
      <Stack.Screen name="ExpelStudent" component={ExpelStudent} />
      <Stack.Screen name="FullLabMap" component={FullLabMap} />
      <Stack.Screen name="ReportIssue" component={ReportIssue} />
      <Stack.Screen name="SendAlert" component={SendAlert} />
      <Stack.Screen name="InvigilatorProfile" component={InvigilatorProfile} />
      <Stack.Screen name="InvigilatorAlerts" component={StudentAlert} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <View style={{ flex: 1 }}>
              <RootNavigator />
              <NetworkStatusBanner />
            </View>
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}