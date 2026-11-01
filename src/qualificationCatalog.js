const qualifications = [
  { name: 'Bachelor of Commerce (BCom)', years: 3 },
  { name: 'Bachelor of Commerce - Associate General Accountant (AGA)', years: 3 },
  { name: 'Bachelor of Commerce - Associate General Accountant (AGA IT)', years: 3 },
  { name: 'Bachelor of Business Administration (BBA)', years: 3 },
  { name: 'Bachelor of Public Management (BPM)', years: 3 },
  { name: 'Diploma in Local Government Management (DLGM)', years: 3 },
  { name: 'Diploma in Business Administration (DBA)', years: 3 },
  { name: 'Higher Certificate in Office Administration (HCOA)', years: 1 },
  { name: 'Higher Certificate in Business Administration (HCBA)', years: 1 },
  { name: 'Higher Certificate in Local Government Management', years: 1 },
  { name: 'Postgraduate Diploma in Management (PGDM)', years: 1 },
  { name: 'Master of Business Administration (MBA)', years: 2 },
  { name: 'Diploma in Information Technology (DIT)', years: 3 },
  { name: 'Higher Certificate in Information Technology', years: 1 },
  { name: 'Bachelor of Science in Information Technology (BSc IT)', years: 3 },
  { name: 'Higher Certificate in Computer Forensics', years: 1 },
  { name: 'Bachelor of Science Honours in Information Technology', years: 1 },
];

const qualificationAliases = new Map([
  ['Diploma in IT', 'Diploma in Information Technology (DIT)'],
  ['Diploma in Information Technology', 'Diploma in Information Technology (DIT)'],
  ['Higher Certificate in IT', 'Higher Certificate in Information Technology'],
  ['Bachelor of IT', 'Bachelor of Science in Information Technology (BSc IT)'],
]);

export function canonicalQualification(course = '') {
  const trimmedCourse = course.trim()
  const alias = [...qualificationAliases.entries()]
    .find(([name]) => name.toLowerCase() === trimmedCourse.toLowerCase())
  return alias?.[1] || trimmedCourse
}

export default qualifications;
