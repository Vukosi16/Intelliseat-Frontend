import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

function getWebStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    throw new Error('Browser local storage is unavailable.')
  }
  return window.localStorage
}

export async function getItem(key) {
  if (Platform.OS === 'web') return getWebStorage().getItem(key)
  return SecureStore.getItemAsync(key)
}

export async function setItem(key, value) {
  if (Platform.OS === 'web') {
    getWebStorage().setItem(key, value)
    return
  }
  await SecureStore.setItemAsync(key, value)
}

export async function deleteItem(key) {
  if (Platform.OS === 'web') {
    getWebStorage().removeItem(key)
    return
  }
  await SecureStore.deleteItemAsync(key)
}
