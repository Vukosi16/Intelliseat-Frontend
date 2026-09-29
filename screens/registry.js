import LoginScreen from './auth/LoginScreen';
import ForgotPasswordScreen from './auth/ForgotPassword';
import NewPasswordScreen from './auth/NewPassword';
import OTPVerificationScreen from './auth/OTPVerification';

import StudentDashboard from './student/StudentDashboard';
import NextExam from './student/NextExam';
import StudentAlert from './student/StudentAlerts';
import StudentProfile from './student/StudentProfile';
import StudentQRCode from './student/StudentQRCode';
import StudentSupport from './student/StudentSupport';

import InvigilatorDashboard from './invigilator/InvigilatorDashboard';
import ExpelStudent from './invigilator/ExpelStudent';
import FullLabMap from './invigilator/FullLabMap';
import ReportIssue from './invigilator/ReportAnIssue';
import ScanStudent from './invigilator/ScanStudent';
import SendAlert from './invigilator/SendAlert';
import SessionDetail from './invigilator/SessionDetail';
import StudentProfileInv from './invigilator/StudentProfile';
import ViewSession from './invigilator/ViewSessions';

export const screens = [
  { name: 'Login', component: LoginScreen, group: 'Auth' },
  { name: 'ForgotPassword', component: ForgotPasswordScreen, group: 'Auth' },
  { name: 'NewPassword', component: NewPasswordScreen, group: 'Auth' },
  { name: 'OTPVerification', component: OTPVerificationScreen, group: 'Auth' },
  { name: 'StudentDashboard', component: StudentDashboard, group: 'Student' },
  { name: 'NextExam', component: NextExam, group: 'Student' },
  { name: 'StudentAlert', component: StudentAlert, group: 'Student' },
  { name: 'StudentProfile', component: StudentProfile, group: 'Student' },
  { name: 'StudentQRCode', component: StudentQRCode, group: 'Student' },
  { name: 'StudentSupport', component: StudentSupport, group: 'Student' },
  { name: 'InvigilatorDashboard', component: InvigilatorDashboard, group: 'Invigilator' },
  { name: 'ExpelStudent', component: ExpelStudent, group: 'Invigilator' },
  { name: 'FullLabMap', component: FullLabMap, group: 'Invigilator' },
  { name: 'ReportIssue', component: ReportIssue, group: 'Invigilator' },
  { name: 'ScanStudent', component: ScanStudent, group: 'Invigilator' },
  { name: 'SendAlert', component: SendAlert, group: 'Invigilator' },
  { name: 'SessionDetail', component: SessionDetail, group: 'Invigilator' },
  { name: 'StudentProfileInv', component: StudentProfileInv, group: 'Invigilator' },
  { name: 'ViewSession', component: ViewSession, group: 'Invigilator' },
];