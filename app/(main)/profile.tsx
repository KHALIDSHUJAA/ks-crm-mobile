import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, StatusBar, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../constants/colors'
import { supabase } from '../../lib/supabase'
import { registerForPushNotificationsAsync, savePushToken, sendPushNotification } from '../../lib/notifications'
import { Alert, TouchableOpacity } from 'react-native'

export default function ProfileScreen() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [userId, setUserId] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [role, setRole] = useState('employee')

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        setUserId(user.id.slice(0, 8).toUpperCase())
        const date = new Date(user.created_at)
        setCreatedAt(date.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' }))
        
        // Get role and name from metadata
        const userRole = user.user_metadata?.role || user.raw_user_meta_data?.role || 'employee'
        setRole(userRole)
        const fullName = user.user_metadata?.full_name || user.raw_user_meta_data?.full_name || ''
        setName(fullName)
      }
    }
    fetchUser()
  }, [])

  const handleManualRegister = async () => {
    try {
      const token = await registerForPushNotificationsAsync()
      if (!token) {
        Alert.alert('فشل', 'تعذر الحصول على رمز الإشعارات. تأكد من إعطاء الإذن في إعدادات الهاتف.')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await savePushToken(user.id, token)
        Alert.alert('نجاح ✅', 'تم تسجيل هاتفك لاستقبال الإشعارات بنجاح!')
      }
    } catch (err: any) {
      Alert.alert('خطأ', err.message)
    }
  }

  const handleTestNotification = async () => {
    try {
      Alert.alert('جاري الإرسال...', 'يتم الآن محاولة إرسال إشعار تجريبي لكافة الأجهزة المسجلة...')
      await sendPushNotification('🔵 إشعار تجريبي', 'هذا الإشعار للتأكد من عمل النظام بشكل صحيح ✅')
    } catch (err: any) {
      Alert.alert('فشل الإرسال', err.message)
    }
  }

  const initials = email ? email.slice(0, 2).toUpperCase() : 'KS'

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <Text style={styles.title}>البروفايل</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Avatar Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{name || (role === 'admin' ? 'صاحب المحل' : 'موظف KS CRM')}</Text>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>ID: #{userId}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
            <Text style={styles.statValue}>نشط</Text>
            <Text style={styles.statLabel}>حالة الحساب</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.gold} />
            <Text style={styles.statValue} numberOfLines={2} style={{ textAlign: 'center', fontSize: 13, fontWeight: 'bold', color: COLORS.gold }}>{createdAt}</Text>
            <Text style={styles.statLabel}>تاريخ الانضمام</Text>
          </View>
        </View>

        {/* Notification Test */}
        <TouchableOpacity style={styles.registerBtn} onPress={handleManualRegister}>
          <Ionicons name="notifications-outline" size={20} color="#fff" />
          <Text style={styles.registerBtnText}>تفعيل الإشعارات على هذا الجهاز</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.registerBtn, { backgroundColor: '#3498db' }]} onPress={handleTestNotification}>
          <Ionicons name="paper-plane-outline" size={20} color="#fff" />
          <Text style={styles.registerBtnText}>إرسال إشعار تجريبي لنفسي</Text>
        </TouchableOpacity>

        {/* Info Note */}
        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={22} color={COLORS.gold} />
          <View style={{ flex: 1 }}>
            <Text style={styles.noteTitle}>إدارة الحساب</Text>
            <Text style={styles.noteText}>
              لتغيير كلمة المرور أو البريد الإلكتروني، يرجى التواصل مع المدير للقيام بذلك من تطبيق الكومبيوتر في قسم "إدارة الهاتف".
            </Text>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionRow}>
          <Text style={styles.versionText}>KS CRM Mobile — الإصدار 1.0.0 (Beta)</Text>
          <Text style={styles.devText}>تطوير: المهندس خالد شجاع</Text>
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.gold, textAlign: 'right' },
  content: { padding: 20, gap: 24, paddingBottom: 80 },

  profileCard: {
    backgroundColor: COLORS.bgInput, borderRadius: 20, padding: 30,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, gap: 8,
  },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    borderWidth: 2, borderColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: COLORS.gold },
  name: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  email: { fontSize: 14, color: COLORS.textSecondary },
  idBadge: {
    backgroundColor: 'rgba(201,162,39,0.1)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.goldBorder,
    marginTop: 4,
  },
  idText: { color: COLORS.gold, fontSize: 12, fontWeight: '700', letterSpacing: 1 },

  statsRow: { flexDirection: 'row', gap: 16 },
  statBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16,
    padding: 20, alignItems: 'center', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)', gap: 6,
  },
  statValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center' },
  statLabel: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },

  noteCard: {
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
    backgroundColor: 'rgba(201,162,39,0.05)', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: COLORS.goldBorder,
  },
  noteTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.gold, textAlign: 'right', marginBottom: 6 },
  noteText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22 },

  versionRow: { alignItems: 'center', gap: 4, paddingTop: 10 },
  versionText: { color: COLORS.textMuted, fontSize: 12 },
  devText: { color: COLORS.textMuted, fontSize: 11, opacity: 0.6 },

  registerBtn: {
    backgroundColor: '#2ecc71', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, padding: 16, borderRadius: 12, marginBottom: 10
  },
  registerBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
})
