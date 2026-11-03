const QUALIFICATION_ABBREVIATIONS = {
  'Diploma in Information Technology (DIT)': 'DIT',
  'Diploma in IT': 'DIT',
  'Diploma in Information Technology': 'DIT',
};

function ordinalYear(year) {
  const number = Number(year);
  if (!Number.isInteger(number)) return '';
  const suffix = number % 100 >= 11 && number % 100 <= 13
    ? 'th'
    : ({ 1: 'st', 2: 'nd', 3: 'rd' }[number % 10] || 'th');
  return `${number}${suffix} year`;
}

export function formatAssessmentTitle(assessment) {
  const qualification = String(assessment?.qualification || '').trim();
  const shortQualification = QUALIFICATION_ABBREVIATIONS[qualification]
    || qualification.match(/\(([^)]+)\)$/)?.[1]
    || qualification;
  const year = ordinalYear(assessment?.qualificationYear);
  const assessmentName = assessment?.moduleId?.name || assessment?.name || 'Assessment';
  const qualificationYear = [shortQualification, year].filter(Boolean).join(' ');
  return [qualificationYear, assessmentName].filter(Boolean).join(' - ');
}
