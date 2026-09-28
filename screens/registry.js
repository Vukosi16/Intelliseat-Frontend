import LoginScreen from './auth/LoginScreen';
import StudentDashboard from './student/StudentDashboard';
import InvigilatorDashboard from './invigilator/InvigilatorDashboard';

export const screens = [
  { name: 'Login', component: LoginScreen, group: 'Auth' },
  { name: 'StudentDashboard', component: StudentDashboard, group: 'Student' },
  { name: 'InvigilatorDashboard', component: InvigilatorDashboard, group: 'Invigilator' },
];