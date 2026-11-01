const configuredUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const API_URL = configuredUrl.replace(/\/api$/, '')

export function getToken() {
  return sessionStorage.getItem('intelliseat_token')
}

export function setAuth({ token, user }) {
  if (token) sessionStorage.setItem('intelliseat_token', token)
  if (user) sessionStorage.setItem('intelliseat_user', JSON.stringify(user))
}

export function clearAuth() {
  sessionStorage.removeItem('intelliseat_token')
  sessionStorage.removeItem('intelliseat_user')
}

export function getStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem('intelliseat_user') || 'null')
  } catch {
    return null
  }
}

export async function request(path, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const apiPath = `/api/${path.replace(/^\/?(api\/)?/, '')}`
  const response = await fetch(`${API_URL}${apiPath}`, { ...options, headers })
  const payload = await response.json().catch(() => null)
  if (response.status === 401) {
    clearAuth()
    window.dispatchEvent(new CustomEvent('intelliseat:unauthorized'))
  }
  if (!response.ok) throw new Error(payload?.message || payload?.error || 'Request failed')
  return payload
}
