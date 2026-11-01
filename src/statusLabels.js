export const statusLabels = {
  clearanceStatus: {
    cleared: 'Cleared',
    outstanding_fees: 'Outstanding fees',
    documents_pending: 'Documents pending',
  },
  eligibility: { eligible: 'Eligible', needs_review: 'Needs review' },
  issue: { open: 'Open', in_progress: 'In progress', resolved: 'Resolved' },
  assessment: { upcoming: 'Upcoming', in_progress: 'In progress', completed: 'Completed' },
}

export function labelFor(group, value) {
  return statusLabels[group]?.[value] || value
}
