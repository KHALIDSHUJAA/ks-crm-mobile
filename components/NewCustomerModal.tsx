import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, KeyboardAvoidingView,
  Platform, Alert, ScrollView, Pressable
} from 'react-native'
import { supabase } from '../lib/supabase'
import { COLORS } from '../constants/colors'
import LoadingSpinner from './LoadingSpinner'
import { sendPushNotification } from '../lib/notifications'

interface NewCustomerModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function NewCustomerModal({ visible, onClose, onSuccess }: NewCustomerModalProps) {
  const [customerName, setCustomerName] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const [debtAmount, setDebtAmount] = useState('')
  const [debtNote, setDebtNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible) {
      setCustomerName('')
      setCustomerNote('')
      setDebtAmount('')
      setDebtNote('')
    }
  }, [visible])

  const formatAmount = (text: string) => {
    const normalized = text.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    const cleanNumber = normalized.replace(/[^0-9.]/g, '')
    if (!cleanNumber) return ''
    const parts = cleanNumber.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return parts.join('.')
  }

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      Alert.alert('', 'يجب إدخال اسم العميل')
      return
    }

    const numAmount = debtAmount ? parseFloat(debtAmount.replace(/,/g, '')) : 0

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('phone_events').insert({
        customer_id: 0, // placeholder for new customers
        customer_name: customerName.trim(),
        type: 'new_customer',
        amount: numAmount || 0,
        currency: 'IQD',
        note: JSON.stringify({
          customerNote: customerNote.trim() || null,
          debtNote: debtNote.trim() || null,
        }),
        status: 'pending',
        employee_id: user.id,
      })

      if (error) throw error

      // Send push notification to admins
      await sendPushNotification(
        '🆕 عميل جديد بانتظار الإضافة',
        `طلب الموظف إضافة العميل: ${customerName.trim()}${numAmount > 0 ? ` بدين ${debtAmount} د.ع` : ''}`,
        { type: 'new_customer' }
      )

      onSuccess()
    } catch (e) {
      Alert.alert('❌', 'حدث خطأ أثناء الإرسال. يرجى المحاولة مجدداً.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.glassContainer}>
          {/* Glass shine effect */}
          <View style={styles.glassShine} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🆕 إضافة عميل جديد</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            سيتم إرسال الطلب إلى الإدارة للمراجعة والإضافة
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Customer Name */}
            <View style={styles.field}>
              <Text style={styles.label}>اسم العميل <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="الاسم الكامل للعميل..."
                placeholderTextColor={COLORS.textMuted}
                value={customerName}
                onChangeText={setCustomerName}
                textAlign="right"
                autoFocus={true}
              />
            </View>

            {/* Customer Note */}
            <View style={styles.field}>
              <Text style={styles.label}>ملاحظة عن العميل <Text style={styles.optional}>(اختياري)</Text></Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="مثلاً: عنوان العميل، رقم هاتفه..."
                placeholderTextColor={COLORS.textMuted}
                value={customerNote}
                onChangeText={setCustomerNote}
                multiline
                textAlign="right"
                textAlignVertical="top"
              />
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>معلومات الدين الأولي</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Debt Amount */}
            <View style={styles.field}>
              <Text style={styles.label}>مبلغ الدين <Text style={styles.optional}>(اختياري)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="0 د.ع"
                placeholderTextColor={COLORS.textMuted}
                value={debtAmount}
                onChangeText={(t) => setDebtAmount(formatAmount(t))}
                keyboardType="decimal-pad"
                textAlign="center"
              />
            </View>

            {/* Debt Note */}
            <View style={styles.field}>
              <Text style={styles.label}>ملاحظة الدين <Text style={styles.optional}>(اختياري)</Text></Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="مثلاً: بضاعة شهر أيار..."
                placeholderTextColor={COLORS.textMuted}
                value={debtNote}
                onChangeText={setDebtNote}
                multiline
                textAlign="right"
                textAlignVertical="top"
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <LoadingSpinner size="small" color="#000" />
              ) : (
                <Text style={styles.submitText}>إرسال طلب الإضافة ✅</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  glassContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(20, 20, 25, 0.96)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.35)',
    maxHeight: '90%',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(30px)',
        boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(201,162,39,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      default: {
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 20,
      },
    }) as any,
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.gold,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginBottom: 22,
    borderRightWidth: 3,
    borderRightColor: 'rgba(201,162,39,0.4)',
    paddingRight: 10,
    lineHeight: 18,
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: 8,
    fontWeight: '600',
  },
  required: { color: '#e74c3c' },
  optional: { color: COLORS.textMuted, fontWeight: '400' },
  input: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    fontSize: 15,
    color: '#fff',
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  divider: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(201,162,39,0.15)',
  },
  dividerText: {
    fontSize: 11,
    color: COLORS.gold,
    opacity: 0.6,
    fontWeight: '700',
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#000', fontWeight: '900', fontSize: 16 },
})
