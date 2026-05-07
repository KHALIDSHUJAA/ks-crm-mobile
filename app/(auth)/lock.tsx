import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TouchableOpacity,
  StyleSheet, StatusBar, Alert,
} from 'react-native'
import { router } from 'expo-router'
import {
  hasPin, savePin, verifyPin,
  isBiometricAvailable, authenticateWithBiometric,
  fullLockout, getAttemptsLeft,
} from '../../lib/auth'
import { COLORS } from '../../constants/colors'
import { STRINGS } from '../../constants/strings'
import PinPad from '../../components/PinPad'
import LoadingSpinner from '../../components/LoadingSpinner'

type LockMode = 'setup' | 'setup-confirm' | 'verify'

export default function LockScreen() {
  const [mode, setMode] = useState<LockMode>('verify')
  const [pin, setPin] = useState('')
  const [firstPin, setFirstPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(5)

  useEffect(() => {
    const init = async () => {
      const hasPinSet = await hasPin()
      const bioAvailable = await isBiometricAvailable()
      setBiometricAvailable(bioAvailable)
      setMode(hasPinSet ? 'verify' : 'setup')
      if (hasPinSet) {
        const left = await getAttemptsLeft()
        setAttemptsLeft(left)
        if (bioAvailable) {
          tryBiometric()
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const tryBiometric = async () => {
    const success = await authenticateWithBiometric()
    if (success) {
      router.replace('/(main)')
    } else {
      setError(STRINGS.biometricFailed)
    }
  }

  const handleDigit = useCallback(async (digit: string) => {
    setError('')
    const newPin = pin + digit
    if (newPin.length > 4) return
    setPin(newPin)

    if (newPin.length === 4) {
      if (mode === 'setup') {
        setFirstPin(newPin)
        setPin('')
        setMode('setup-confirm')
      } else if (mode === 'setup-confirm') {
        if (newPin === firstPin) {
          await savePin(newPin)
          setPin('')
          router.replace('/(main)')
        } else {
          setError(STRINGS.pinMismatch)
          setPin('')
          setFirstPin('')
          setMode('setup')
        }
      } else {
        // verify mode
        const { success, attemptsLeft: left } = await verifyPin(newPin)
        if (success) {
          router.replace('/(main)')
        } else {
          setAttemptsLeft(left)
          if (left <= 0) {
            Alert.alert('تم تجاوز الحد', STRINGS.lockedOut, [
              { text: 'حسناً', onPress: () => router.replace('/(auth)/login') }
            ])
          } else {
            setError(`${STRINGS.wrongPin} — ${STRINGS.pinAttemptsLeft(left)}`)
          }
          setPin('')
        }
      }
    }
  }, [pin, mode, firstPin])

  const handleDelete = useCallback(() => {
    setError('')
    setPin(p => p.slice(0, -1))
  }, [])

  if (loading) return <LoadingSpinner fullScreen />

  const titleText = mode === 'setup'
    ? STRINGS.setupPin
    : mode === 'setup-confirm'
    ? STRINGS.confirmPin
    : STRINGS.lockTitle

  const subtitleText = mode === 'setup'
    ? STRINGS.setupPinSubtitle
    : mode === 'setup-confirm'
    ? STRINGS.confirmPinSubtitle
    : STRINGS.lockSubtitle

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>KS</Text>
        </View>
        <Text style={styles.title}>{titleText}</Text>
        <Text style={styles.subtitle}>{subtitleText}</Text>
      </View>

      {/* PIN Dots */}
      <View style={styles.dotsRow}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={[styles.dot, pin.length > i && styles.dotFilled]}
          />
        ))}
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* PIN Pad */}
      <PinPad onPress={handleDigit} onDelete={handleDelete} />

      {/* Biometric Button */}
      {mode === 'verify' && biometricAvailable && (
        <TouchableOpacity style={styles.bioButton} onPress={tryBiometric} activeOpacity={0.7}>
          <Text style={styles.bioText}>{STRINGS.useBiometric}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center', gap: 28, padding: 24,
  },
  header: { alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.goldFaint, borderWidth: 2, borderColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 24, fontWeight: '900', color: COLORS.gold },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary },
  dotsRow: { flexDirection: 'row', gap: 20 },
  dot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: COLORS.goldDim,
    backgroundColor: 'transparent',
  },
  dotFilled: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  errorBox: {
    backgroundColor: COLORS.redFaint, borderRadius: 10, padding: 10, width: '100%',
    borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)',
  },
  errorText: { color: COLORS.red, textAlign: 'center', fontSize: 14 },
  bioButton: {
    marginTop: 10, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 30, borderWidth: 1, borderColor: COLORS.goldBorder,
  },
  bioText: { color: COLORS.gold, fontSize: 15, fontWeight: '600' },
})
