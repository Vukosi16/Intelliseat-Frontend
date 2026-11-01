import * as secureStorage from './utils/secureStorage'

const configuredUrl = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '')
const API_URL = configuredUrl.replace(/\/api$/, '')
const TOKEN_KEY = 'intelliseat_token'
const USER_KEY = 'intelliseat_user'
let memoryToken = null

export async function setToken(token) {
  memoryToken = token
  await secureStorage.setItem(TOKEN_KEY, token)
}

export async function clearToken() {
  memoryToken = null
  await secureStorage.deleteItem(TOKEN_KEY)
  await secureStorage.deleteItem(USER_KEY)
}

export async function restoreSession() {
  const [token, userJson] = await Promise.all([
    secureStorage.getItem(TOKEN_KEY),
    secureStorage.getItem(USER_KEY),
  ])
  if (!token || !userJson) return null
  try {
    const user = JSON.parse(userJson)
    memoryToken = token
    return { token, user }
  } catch {
    await clearToken()
    return null
  }
}

export async function setSession(token, user) {
  await setToken(token)
  await secureStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function unwrapList(data, key) {
  if (Array.isArray(data)) return data
  if (data && key && Array.isArray(data[key])) return data[key]
  if (data && Array.isArray(data.data)) return data.data
  return []
}

export async function request(path, options = {}) {
  if (!API_URL) {
    throw new Error('API URL is not configured. Set EXPO_PUBLIC_API_URL in .env.')
  }

  const token = memoryToken || await secureStorage.getItem(TOKEN_KEY)
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const apiPath = `/api/${path.replace(/^\/?(api\/)?/, '')}`
  let response
  try {
    response = await fetch(`${API_URL}${apiPath}`, { ...options, headers })
  } catch {
    const error = new Error('Unable to connect to IntelliSeat. Check your internet connection and try again.')
    error.code = 'NETWORK_ERROR'
    throw error
  }
  const payload = await response.json().catch(() => null)
  if (response.status === 401) {
    await clearToken()
  }
  if (!response.ok) throw new Error(payload?.message || payload?.error || 'Request failed')
  return payload
}
