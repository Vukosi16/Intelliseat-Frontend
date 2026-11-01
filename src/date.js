const timeZone = 'Africa/Johannesburg'

function format(value, options) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-ZA', { ...options, timeZone }).format(new Date(value))
}

export function formatDate(value) {
  return format(value, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatTime(value) {
  return format(value, { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function formatDateTime(value) {
  return format(value, { dateStyle: 'medium', timeStyle: 'short' })
}
