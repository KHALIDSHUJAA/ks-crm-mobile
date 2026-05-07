import * as SecureStore from 'expo-secure-store'
import * as LocalAuthentication from 'expo-local-authentication'
import { Platform } from 'react-native'
import { supabase } from './supabase'

const PIN_KEY = 'ks_crm_pin'
const PIN_ATTEMPTS_KEY = 'ks_crm_pin_attempts'
const REMEMBERED_EMAIL_KEY = 'ks_crm_remembered_email'
const MAX_ATTEMPTS = 5

// ============================
// Web Polyfill for SecureStore
// ============================
async function safeSetItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value)
  } else {
    await SecureStore.setItemAsync(key, value)
  }
}

async function safeGetItem(key: string) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key) || null
  }
  return await SecureStore.getItemAsync(key)
}

async function safeDeleteItem(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key)
  } else {
    await SecureStore.deleteItemAsync(key)
  }
}

// ============================
// PIN Management
// ============================

export async function savePin(pin: string): Promise<void> {
  await safeSetItem(PIN_KEY, pin)
  await safeSetItem(PIN_ATTEMPTS_KEY, '0')
}

export async function getPin(): Promise<string | null> {
  return safeGetItem(PIN_KEY)
}

export async function hasPin(): Promise<boolean> {
  const pin = await getPin()
  return pin !== null && pin.length === 4
}

export async function verifyPin(inputPin: string): Promise<{ success: boolean; attemptsLeft: number }> {
  const stored = await getPin()
  const attemptsStr = await safeGetItem(PIN_ATTEMPTS_KEY) ?? '0'
  let attempts = parseInt(attemptsStr, 10)

  if (inputPin === stored) {
    await safeSetItem(PIN_ATTEMPTS_KEY, '0')
    return { success: true, attemptsLeft: MAX_ATTEMPTS }
  }

  attempts += 1
  await safeSetItem(PIN_ATTEMPTS_KEY, attempts.toString())
  const attemptsLeft = MAX_ATTEMPTS - attempts

  // Only on full lockout: delete PIN AND logout
  if (attemptsLeft <= 0) {
    await fullLockout()
  }

  return { success: false, attemptsLeft }
}

export async function getAttemptsLeft(): Promise<number> {
  const str = await safeGetItem(PIN_ATTEMPTS_KEY) ?? '0'
  return MAX_ATTEMPTS - parseInt(str, 10)
}

// ============================
// Biometric Authentication
// ============================

export async function isBiometricAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false
  const compatible = await LocalAuthentication.hasHardwareAsync()
  const enrolled = await LocalAuthentication.isEnrolledAsync()
  return compatible && enrolled
}

export async function authenticateWithBiometric(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'تحقق من هويتك للمتابعة',
    cancelLabel: 'إلغاء',
    fallbackLabel: 'استخدم PIN',
    disableDeviceFallback: true,
  })
  return result.success
}

// ============================
// Session Management
// ============================

// Normal logout — only ends Supabase session, PIN is PRESERVED
export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

// Full lockout after 5 wrong PINs — deletes PIN + logs out
export async function fullLockout(): Promise<void> {
  await safeDeleteItem(PIN_KEY)
  await safeDeleteItem(PIN_ATTEMPTS_KEY)
  await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ============================
// Remember Email
// ============================

export async function saveRememberedEmail(email: string): Promise<void> {
  await safeSetItem(REMEMBERED_EMAIL_KEY, email)
}

export async function getRememberedEmail(): Promise<string | null> {
  return safeGetItem(REMEMBERED_EMAIL_KEY)
}

export async function clearRememberedEmail(): Promise<void> {
  await safeDeleteItem(REMEMBERED_EMAIL_KEY)
}
