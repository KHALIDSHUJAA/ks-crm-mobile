import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, Switch,
} from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { hasPin, saveRememberedEmail, getRememberedEmail, clearRememberedEmail } from '../../lib/auth'
import { COLORS } from '../../constants/colors'
import { STRINGS } from '../../constants/strings'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  // Load remembered email on mount
  useEffect(() => {
    const loadEmail = async () => {
      const saved = await getRememberedEmail()
      if (saved) {
        setEmail(saved)
        setRememberMe(true)
      }
    }
    loadEmail()
  }, [])

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (authError) {
        setError(STRINGS.loginError)
        return
      }

      // Handle remember me
      if (rememberMe) {
        await saveRememberedEmail(email.trim().toLowerCase())
      } else {
        await clearRememberedEmail()
      }

      // Go to lock screen (PIN is preserved from previous session if exists)
      router.replace('/(auth)/lock')
    } catch {
      setError(STRINGS.networkError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>KS</Text>
          </View>
          <Text style={styles.title}>{STRINGS.loginTitle}</Text>
          <Text style={styles.subtitle}>{STRINGS.loginSubtitle}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{STRINGS.emailPlaceholder}</Text>
            <TextInput
              style={styles.input}
              placeholder={STRINGS.emailPlaceholder}
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign="right"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{STRINGS.passwordPlaceholder}</Text>
            <TextInput
              style={styles.input}
              placeholder={STRINGS.passwordPlaceholder}
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textAlign="right"
              editable={!loading}
            />
          </View>

          {/* Remember Me Toggle */}
          <View style={styles.rememberRow}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: COLORS.border, true: COLORS.goldDim }}
              thumbColor={rememberMe ? COLORS.gold : COLORS.textMuted}
              ios_backgroundColor={COLORS.bgInput}
            />
            <Text style={styles.rememberText}>تذكرني لاحقاً</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <LoadingSpinner size="small" />
              : <Text style={styles.buttonText}>{STRINGS.loginButton}</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>تطوير: المهندس خالد شجاع | 00905525432976</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 32 },
  logoArea: { alignItems: 'center', gap: 12 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.goldFaint,
    borderWidth: 2, borderColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 28, fontWeight: '900', color: COLORS.gold },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary },
  form: { gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right' },
  input: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    padding: 14, fontSize: 16, color: COLORS.textPrimary,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingVertical: 4,
  },
  rememberText: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600' },
  errorBox: {
    backgroundColor: COLORS.redFaint, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)',
  },
  errorText: { color: COLORS.red, textAlign: 'center', fontSize: 14 },
  button: {
    backgroundColor: COLORS.gold, borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#000', fontWeight: '800', fontSize: 17 },
  footer: { textAlign: 'center', fontSize: 11, color: COLORS.textMuted, marginTop: 20 },
})
