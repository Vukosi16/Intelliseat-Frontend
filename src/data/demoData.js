// Sample records keep the frontend usable until it is connected to an API.
export const navigation = [
  { id: 'overview', label: 'Dashboard', icon: '⌂' },
  { id: 'users', label: 'Create Users', icon: '+' },
  { id: 'eligibility', label: 'Student Eligibility', icon: '✓' },
  { id: 'assessments', label: 'Create Assessment', icon: '▤' },
  { id: 'reports', label: 'Reports', icon: '▥' },
  { id: 'support', label: 'Support Queue', icon: '⌁' },
  { id: 'alerts', label: 'Create Alert', icon: '✉' },
]

export const initialSessions = [
  {
    module: 'ITSD200 — Systems Design',
    lab: 'Lab 2',
    time: '09:00–11:00',
    checked: '38/40',
    status: 'In progress',
  },
  {
    module: 'NET150 — Networking Fundamentals',
    lab: 'Lab 4',
    time: '11:30–13:00',
    checked: '0/32',
    status: 'Upcoming',
  },
]

export const initialStudents = [
  {
    name: 'Lindiwe Khosa',
    number: 'RC2026-10482',
    course: 'Diploma in IT',
    year: 'Year 1',
    clearance: 'Cleared',
    eligible: true,
  },
  {
    name: 'Sipho Mokoena',
    number: 'RC2026-10917',
    course: 'Diploma in Networking',
    year: 'Year 2',
    clearance: 'Outstanding fees',
    eligible: false,
  },
  {
    name: 'Amara Dlamini',
    number: 'RC2026-10138',
    course: 'Diploma in IT',
    year: 'Year 3',
    clearance: 'Cleared',
    eligible: true,
  },
  {
    name: 'Thabo Nkosi',
    number: 'RC2026-11204',
    course: 'Higher Certificate in IT',
    year: 'Year 1',
    clearance: 'Documents pending',
    eligible: false,
  },
]

export const initialIssues = [
  {
    student: 'Siyanda Ndlovu',
    issue: 'Workstation will not start',
    location: 'Lab 2 · PC 14',
    time: '09:18',
    status: 'Open',
  },
  {
    student: 'Noluthando Maseko',
    issue: 'Unable to sign in to assessment',
    location: 'Lab 4 · PC 08',
    time: '08:52',
    status: 'In progress',
  },
  {
    student: 'Musa Zulu',
    issue: 'Keyboard keys not responding',
    location: 'Lab 2 · PC 06',
    time: '08:37',
    status: 'Open',
  },
]

export const initialAssessments = [
  {
    module: 'ITSD200 — Systems Design',
    date: '15 Sep 2026',
    time: '09:00',
    location: 'Lab 2',
    students: 40,
  },
  {
    module: 'NET150 — Networking Fundamentals',
    date: '15 Sep 2026',
    time: '11:30',
    location: 'Lab 4',
    students: 32,
  },
]
