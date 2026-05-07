import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { COLORS } from '../../constants/colors'
import { STRINGS } from '../../constants/strings'
import { EventType, Currency } from '../../lib/types'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function LogEventScreen() {
  const params = useLocalSearchParams<{
    customerId: string
    customerName: string
    balanceIqd: string
    balanceUsd: string
    presetType?: string
  }>()

  const [type, setType] = useState<EventType>((params.presetType as EventType) || 'debt')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>('IQD')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  // Reset state when screen loses focus (e.g., navigating back)
  useFocusEffect(
    React.useCallback(() => {
      // Focused
      return () => {
        // Blurred - reset everything
        setAmount('')
        setNote('')
        setCurrency('IQD')
        setType((params.presetType as EventType) || 'debt')
      }
    }, [params.presetType])
  )

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount.replace(/,/g, ''))
    if (!amount.trim()) {
      Alert.alert('', STRINGS.amountRequired)
      return
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('', STRINGS.invalidAmount)
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('phone_events').insert({
        customer_id: parseInt(params.customerId),
        customer_name: params.customerName,
        type,
        amount: numAmount,
        currency,
        note: note.trim() || null,
        status: 'pending',
        employee_id: user.id,
      })

      if (error) throw error

      // Reset state and navigate smoothly to dashboard
      setAmount('')
      setNote('')
      router.navigate('/(main)?success=true')
    } catch {
      Alert.alert('❌', STRINGS.eventError)
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>→</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{STRINGS.logEventTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Customer Info */}
        <View style={styles.customerBanner}>
          <Text style={styles.customerName}>{params.customerName}</Text>
          <Text style={styles.customerBalance}>
            رصيد: {parseFloat(params.balanceIqd || '0').toLocaleString('en-US')} د.ع
            {parseFloat(params.balanceUsd || '0') !== 0
              ? `  |  $${parseFloat(params.balanceUsd || '0').toLocaleString('en-US')}`
              : ''}
          </Text>
        </View>

        {/* Event Type Toggle */}
        <View style={styles.section}>
          <Text style={styles.label}>{STRINGS.eventType}</Text>
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, type === 'debt' && styles.debtActive]}
              onPress={() => setType('debt')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, type === 'debt' && styles.debtActiveText]}>
                📉 {STRINGS.debtType}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, type === 'payment' && styles.paymentActive]}
              onPress={() => setType('payment')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, type === 'payment' && styles.paymentActiveText]}>
                📈 {STRINGS.paymentType}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>{STRINGS.amountLabel}</Text>
          <TextInput
            style={styles.input}
            placeholder={STRINGS.amountPlaceholder}
            placeholderTextColor={COLORS.textMuted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            textAlign="right"
          />
        </View>

        {/* Currency */}
        <View style={styles.section}>
          <Text style={styles.label}>{STRINGS.currencyLabel}</Text>
          <View style={styles.toggle}>
            {(['IQD', 'USD'] as Currency[]).map(cur => (
              <TouchableOpacity
                key={cur}
                style={[styles.toggleBtn, currency === cur && styles.currencyActive]}
                onPress={() => setCurrency(cur)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleText, currency === cur && styles.currencyActiveText]}>
                  {cur === 'IQD' ? '🇮🇶 دينار' : '🇺🇸 دولار'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.label}>{STRINGS.noteLabel}</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder={STRINGS.notePlaceholder}
            placeholderTextColor={COLORS.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            textAlign="right"
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <LoadingSpinner size="small" /> : (
            <Text style={styles.submitText}>{STRINGS.submitButton}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 24, color: COLORS.gold },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  inner: { padding: 20, gap: 20, paddingBottom: 40 },
  customerBanner: {
    backgroundColor: COLORS.goldFaint, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: COLORS.goldBorder, gap: 4,
  },
  customerName: { fontSize: 18, fontWeight: '800', color: COLORS.gold, textAlign: 'right' },
  customerBalance: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right' },
  section: { gap: 8 },
  label: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'right' },
  input: {
    backgroundColor: COLORS.bgInput, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 14, fontSize: 16, color: COLORS.textPrimary,
  },
  noteInput: { minHeight: 80 },
  toggle: { flexDirection: 'row', gap: 12 },
  toggleBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.border,
  },
  toggleText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  debtActive: { backgroundColor: COLORS.redFaint, borderColor: 'rgba(231,76,60,0.5)' },
  debtActiveText: { color: COLORS.red },
  paymentActive: { backgroundColor: COLORS.greenFaint, borderColor: 'rgba(46,204,113,0.5)' },
  paymentActiveText: { color: COLORS.green },
  currencyActive: { backgroundColor: COLORS.goldFaint, borderColor: COLORS.goldBorder },
  currencyActiveText: { color: COLORS.gold },
  submitBtn: {
    backgroundColor: COLORS.gold, borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#000', fontWeight: '800', fontSize: 17 },
})
