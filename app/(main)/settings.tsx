import React from 'react'
import { View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { logout, fullLockout } from '../../lib/auth'
import { COLORS } from '../../constants/colors'

export default function SettingsScreen() {
  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

  const handleLockout = async () => {
    await fullLockout()
    router.replace('/(auth)/login')
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <Text style={styles.title}>الإعدادات</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الأمان والحساب</Text>

          <TouchableOpacity style={styles.btn} onPress={handleLogout} activeOpacity={0.8}>
            <View style={styles.btnLeft}>
              <Ionicons name="log-out-outline" size={22} color={COLORS.textPrimary} />
              <View>
                <Text style={styles.btnText}>تسجيل خروج</Text>
                <Text style={styles.btnSubtext}>يحتفظ برمز PIN للدخول السريع</Text>
              </View>
            </View>
            <Ionicons name="chevron-back" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.dangerBtn]} onPress={handleLockout} activeOpacity={0.8}>
            <View style={styles.btnLeft}>
              <Ionicons name="lock-closed" size={22} color={COLORS.red} />
              <View>
                <Text style={[styles.btnText, { color: COLORS.red }]}>قفل التطبيق وحذف PIN</Text>
                <Text style={styles.btnSubtext}>سيتطلب تعيين PIN جديد في الدخول القادم</Text>
              </View>
            </View>
            <Ionicons name="chevron-back" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Admin Info Note */}
        <View style={styles.adminNote}>
          <Ionicons name="desktop-outline" size={28} color={COLORS.gold} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.adminNoteTitle}>إدارة حسابات الموظفين</Text>
            <Text style={styles.adminNoteText}>
              إنشاء حسابات الموظفين، تغيير كلمات المرور، والإيميلات — تتم فقط من تطبيق الكومبيوتر في قسم{' '}
              <Text style={{ color: COLORS.gold, fontWeight: 'bold' }}>"إدارة الهاتف"</Text>.
            </Text>
          </View>
        </View>

        {/* System Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات النظام</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoValue}>1.0.0 (Beta)</Text>
              <Text style={styles.infoLabel}>الإصدار</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoValue, { color: COLORS.green }]}>متصل ✓</Text>
              <Text style={styles.infoLabel}>حالة الخادم</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoValue}>Supabase Cloud</Text>
              <Text style={styles.infoLabel}>قاعدة البيانات</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>تطوير: المهندس خالد شجاع | 00905525432976</Text>

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
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'right' },
  content: { padding: 20, gap: 30, paddingBottom: 80 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 15, color: COLORS.textMuted, fontWeight: '600', textAlign: 'right', marginBottom: 4 },

  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.bgInput, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border,
  },
  dangerBtn: { backgroundColor: 'rgba(231,76,60,0.05)', borderColor: 'rgba(231,76,60,0.2)' },
  btnLeft: { flexDirection: 'row', gap: 14, alignItems: 'center', flex: 1 },
  btnText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: 'bold' },
  btnSubtext: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },

  adminNote: {
    flexDirection: 'row', gap: 16, alignItems: 'flex-start',
    backgroundColor: 'rgba(201,162,39,0.06)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: COLORS.goldBorder,
  },
  adminNoteTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'right' },
  adminNoteText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right', lineHeight: 22 },

  infoCard: {
    backgroundColor: COLORS.bgInput, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoLabel: { color: COLORS.textSecondary, fontSize: 15 },
  infoValue: { color: COLORS.textPrimary, fontSize: 15, fontWeight: 'bold' },

  footer: { textAlign: 'center', fontSize: 11, color: COLORS.textMuted },
})
