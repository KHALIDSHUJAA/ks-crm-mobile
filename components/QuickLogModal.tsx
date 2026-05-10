import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, KeyboardAvoidingView,
  Platform, Alert, ScrollView, Pressable
} from 'react-native'
import { supabase } from '../lib/supabase'
import { COLORS } from '../constants/colors'
import { STRINGS } from '../constants/strings'
import { EventType, Currency, Customer } from '../lib/types'
import LoadingSpinner from './LoadingSpinner'
import { sendPushNotification } from '../lib/notifications'

interface QuickLogModalProps {
  visible: boolean
  onClose: () => void
  initialCustomer?: Customer | null
  presetType: EventType
  onSuccess: () => void
}

export default function QuickLogModal({ visible, onClose, initialCustomer, presetType, onSuccess }: QuickLogModalProps) {
  const [type, setType] = useState<EventType>(presetType)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>('IQD')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Sync state when modal opens
  useEffect(() => {
    if (visible) {
      setType(presetType)
      setCustomer(initialCustomer || null)
      setSearchQuery('')
      setSearchResults([])
      setAmount('')
      setNote('')
      setCurrency('IQD')
    }
  }, [visible, presetType, initialCustomer])

  const formatAmount = (text: string) => {
    // 1. Convert Arabic/Eastern digits to English
    const normalized = text.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
    
    // 2. Remove all non-numeric characters except one dot
    const cleanNumber = normalized.replace(/[^0-9.]/g, '')
    
    // 3. Format with thousands separator
    if (!cleanNumber) return ''
    const parts = cleanNumber.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts.join('.')
  }

  const handleAmountChange = (text: string) => {
    setAmount(formatAmount(text))
  }

  const handleSearch = async (text: string) => {
    setSearchQuery(text)
    if (text.trim().length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, balance_iqd, balance_usd')
        .or(`name.ilike.%${text.trim()}%,phone.ilike.%${text.trim()}%`)
        .limit(10)
        .order('name')

      if (!error && data) {
        setSearchResults(data as Customer[])
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async () => {
    if (!customer) return
    const numAmount = parseFloat(amount.replace(/,/g, ''))
    
    if (!amount.trim()) {
      Alert.alert('', 'يجب إدخال المبلغ أولاً')
      return
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('', STRINGS.invalidAmount)
      return
    }
    if (!note.trim()) {
      Alert.alert('', 'يجب إدخال بيان العملية (الملاحظات)')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('phone_events').insert({
        customer_id: customer.id,
        customer_name: customer.name,
        type,
        amount: numAmount,
        currency,
        note: note.trim() || null,
        status: 'pending',
        employee_id: user.id,
      })

      if (error) throw error

      // Send push notification to admins
      const title = type === 'debt' ? '🔴 تسجيل دين جديد' : '🟢 تسجيل سداد جديد'
      const body = `قام الموظف بتسجيل ${type === 'debt' ? 'دين' : 'سداد'} للعميل ${customer.name} بمبلغ ${amount} د.ع`
      await sendPushNotification(title, body, { customerId: customer.id, type })

      onSuccess()
    } catch (e) {
      Alert.alert('❌', STRINGS.eventError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={[styles.title, type === 'debt' && { color: '#ff4d4d' }, type === 'payment' && { color: '#2ecc71' }]}>
              {!customer ? 'البحث عن عميل' : (type === 'debt' ? 'تسجيل دين' : 'تسجيل سداد')}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            {!customer ? (
              <View style={{ minHeight: 300 }}>
                <View style={styles.searchBox}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="ابحث بالاسم أو الهاتف..."
                    placeholderTextColor={COLORS.textMuted}
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoFocus={true}
                    textAlign="right"
                  />
                  <Text style={{ fontSize: 18 }}>🔍</Text>
                </View>

                {isSearching ? (
                  <LoadingSpinner size="small" />
                ) : (
                  searchResults.map(c => (
                    <TouchableOpacity 
                      key={c.id} 
                      style={styles.searchResult}
                      onPress={() => setCustomer(c)}
                    >
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.resultName}>{c.name}</Text>
                        <Text style={styles.resultPhone}>{c.phone || 'بدون هاتف'}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-start' }}>
                        <Text style={styles.resultBalance}>{c.balance_iqd.toLocaleString()} د.ع</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
                {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                  <Text style={styles.noResultText}>لا توجد نتائج مطابقة</Text>
                )}
              </View>
            ) : (
              <>
                <View style={styles.customerBanner}>
                  <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={styles.customerName}>{customer.name}</Text>
                      <Text style={styles.customerBalance}>اجمالي الدين: {customer.balance_iqd.toLocaleString()} د.ع</Text>
                    </View>
                    <TouchableOpacity onPress={() => setCustomer(null)} style={styles.changeBtn}>
                      <Text style={styles.changeBtnText}>تغيير 🔄</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Amount Input */}
                <View style={styles.section}>
                  <Text style={styles.label}>المبلغ <Text style={{ color: COLORS.gold }}>(د.ع)</Text></Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="0"
                      placeholderTextColor={COLORS.textMuted}
                      value={amount}
                      onChangeText={handleAmountChange}
                      keyboardType="numeric"
                      textAlign="center"
                      autoFocus={true}
                    />
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.label}>ملاحظات</Text>
                  <TextInput
                    style={[styles.input, styles.noteInput]}
                    placeholder="بيان العملية..."
                    placeholderTextColor={COLORS.textMuted}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    textAlign="right"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitBtn, loading && styles.submitDisabled, type === 'debt' && { backgroundColor: '#c0392b' }, type === 'payment' && { backgroundColor: '#27ae60' }]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner size="small" color="#fff" /> : (
                    <Text style={styles.submitText}>تأكيد {type === 'debt' ? 'الدين' : 'السداد'} ✅</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
            
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)' },
  sheet: {
    backgroundColor: '#111', borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingTop: 12, maxHeight: '90%', borderWidth: 1, borderColor: 'rgba(255,215,0,0.15)',
  },
  handle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 10 },
  header: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 25, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.gold },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#fff', fontSize: 14, opacity: 0.7 },
  content: { padding: 20 },
  customerBanner: { backgroundColor: 'rgba(255,215,0,0.05)', borderRadius: 15, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,215,0,0.1)' },
  customerName: { fontSize: 18, fontWeight: 'bold', color: '#fff', textAlign: 'right', marginBottom: 4 },
  customerBalance: { fontSize: 14, color: COLORS.gold, textAlign: 'right', opacity: 0.8 },
  changeBtn: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  changeBtnText: { color: '#fff', fontSize: 12, opacity: 0.8 },
  section: { marginBottom: 16 },
  label: { fontSize: 13, color: COLORS.textMuted, marginBottom: 8, textAlign: 'right' },
  input: { backgroundColor: '#000', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)', padding: 14, fontSize: 16, color: '#fff' },
  noteInput: { minHeight: 80, textAlignVertical: 'top' },
  toggle: { flexDirection: 'row', gap: 12 },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  toggleText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  debtActive: { backgroundColor: 'rgba(231, 76, 60, 0.15)', borderColor: 'rgba(231, 76, 60, 0.4)' },
  debtActiveText: { color: '#ff4d4d' },
  paymentActive: { backgroundColor: 'rgba(46, 204, 113, 0.15)', borderColor: 'rgba(46, 204, 113, 0.4)' },
  paymentActiveText: { color: '#2ecc71' },
  currencyActive: { backgroundColor: 'rgba(255, 215, 0, 0.15)', borderColor: COLORS.gold },
  currencyActiveText: { color: COLORS.gold },
  submitBtn: { backgroundColor: COLORS.gold, borderRadius: 15, padding: 16, alignItems: 'center', marginTop: 10 },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#000', fontWeight: '900', fontSize: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)' },
  searchInput: { flex: 1, color: '#fff', fontSize: 16, paddingRight: 10 },
  searchResult: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  resultName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultPhone: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  resultBalance: { color: COLORS.gold, fontSize: 14, fontWeight: 'bold' },
  noResultText: { color: COLORS.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14 },
})
