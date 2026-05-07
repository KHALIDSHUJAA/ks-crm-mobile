import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, StatusBar, ScrollView,
  TouchableOpacity, RefreshControl, Animated, Dimensions, Platform, Image
} from 'react-native'
import { useFocusEffect, router, useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'
import { PhoneEvent } from '../../lib/types'
import { COLORS } from '../../constants/colors'
import EventList from '../../components/EventList'
import { logout, fullLockout } from '../../lib/auth'

const { width } = Dimensions.get('window')

export default function DashboardScreen() {
  const [events, setEvents] = useState<PhoneEvent[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({ totalDebts: 0, totalPayments: 0, pendingCount: 0 })
  const params = useLocalSearchParams<{ success?: string }>()

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(30)).current
  const toastAnim = useRef(new Animated.Value(-100)).current
  const [showToast, setShowToast] = useState(false)

  // Trigger Toast if success param is present
  useEffect(() => {
    if (params.success === 'true') {
      setShowToast(true)
      Animated.sequence([
        Animated.timing(toastAnim, { toValue: Platform.OS === 'web' ? 20 : 50, duration: 400, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(toastAnim, { toValue: -150, duration: 400, useNativeDriver: true })
      ]).start(() => {
        setShowToast(false)
        router.setParams({ success: '' }) // Clear param so it doesn't trigger again
      })
    }
  }, [params.success])

  const loadEvents = async () => {
    try {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('phone_events')
        .select('*')
        .gte('created_at', startOfDay.toISOString())
        .order('created_at', { ascending: false })

      if (!error && data) {
        setEvents(data as PhoneEvent[])
        
        // Calculate stats
        let debts = 0
        let payments = 0
        let pending = 0
        
        data.forEach((e: PhoneEvent) => {
          if (e.type === 'debt') debts += e.amount
          if (e.type === 'payment') payments += e.amount
          if (e.status === 'pending') pending++
        })
        
        setStats({ totalDebts: debts, totalPayments: payments, pendingCount: pending })
      }
    } catch (e) {
      console.error(e)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadEvents()
      
      // Trigger animation on focus
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        })
      ]).start()
      
      return () => {
        fadeAnim.setValue(0)
        translateY.setValue(30)
      }
    }, [])
  )

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadEvents()
    setRefreshing(false)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

  const handleLockout = async () => {
    await fullLockout()
    router.replace('/(auth)/login')
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      
      {/* Success Toast Banner */}
      {showToast && (
        <Animated.View style={[styles.toast, { transform: [{ translateY: toastAnim }] }]}>
          <Text style={styles.toastText}>تم تسجيل العملية بنجاح! ✅</Text>
        </Animated.View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.gold} />
        }
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
          
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>مرحباً بك في</Text>
              <Text style={styles.appName}>KS CRM <Text style={{ color: COLORS.gold }}>Mobile</Text></Text>
            </View>
            <Image 
              source={require('../../assets/images/icon1.png')} 
              style={styles.headerLogo} 
              resizeMode="contain"
            />
          </View>

          {/* Glowing Gradient Cards */}
          <View style={styles.cardsWrapper}>
            {/* Debt Card */}
            <View style={styles.cardContainer}>
              {/* Blur Shadow for Web */}
              <LinearGradient
                colors={['#ea5358', '#f7ba2b']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[
                  StyleSheet.absoluteFill,
                  { top: 20, transform: [{ scale: 0.8 }], zIndex: -1 },
                  Platform.select({ web: { filter: 'blur(25px)' }, default: { opacity: 0.4 } }) as any
                ]}
              />
              <LinearGradient
                colors={['#ea5358', '#f7ba2b']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.cardBorder}
              >
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>إجمالي الديون (اليوم)</Text>
                    <Text style={styles.cardIcon}>📉</Text>
                  </View>
                  <Text style={styles.cardAmount}>{formatCurrency(stats.totalDebts)} <Text style={styles.currency}>د.ع</Text></Text>
                </View>
              </LinearGradient>
            </View>

            {/* Payment Card */}
            <View style={styles.cardContainer}>
              {/* Blur Shadow for Web */}
              <LinearGradient
                colors={['#01baef', '#20bf55']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[
                  StyleSheet.absoluteFill,
                  { top: 20, transform: [{ scale: 0.8 }], zIndex: -1 },
                  Platform.select({ web: { filter: 'blur(25px)' }, default: { opacity: 0.4 } }) as any
                ]}
              />
              <LinearGradient
                colors={['#01baef', '#20bf55']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.cardBorder}
              >
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>إجمالي السدادات (اليوم)</Text>
                    <Text style={styles.cardIcon}>📈</Text>
                  </View>
                  <Text style={styles.cardAmount}>{formatCurrency(stats.totalPayments)} <Text style={styles.currency}>د.ع</Text></Text>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Pending Sync Indicator */}
          {stats.pendingCount > 0 && (
            <View style={styles.pendingBanner}>
              <Text style={styles.pendingText}>⏳ يوجد {stats.pendingCount} حركة معلقة بانتظار الاعتماد من الإدارة</Text>
            </View>
          )}



          {/* Recent Movements */}
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>📋 حركات اليوم</Text>
          </View>

          {events.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>لا توجد حركات مسجلة هذا اليوم</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              <EventList events={events} onRefresh={loadEvents} />
            </View>
          )}
          
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 20,
  },
  greeting: { fontSize: 16, color: COLORS.textMuted, marginBottom: 4, textAlign: 'right' },
  appName: { fontSize: 28, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 1, textAlign: 'right' },
  headerLogo: {
    width: 90, 
    height: 90, 
  },
  
  cardsWrapper: { paddingHorizontal: 16, gap: 20, marginTop: 10, flexDirection: 'row' },
  cardContainer: {
    flex: 1,
    height: 180,
    position: 'relative',
    zIndex: 1,
  },
  cardBorder: {
    flex: 1,
    padding: 4, // border width
    borderRadius: 16, // 1rem
  },
  cardInfo: {
    flex: 1,
    backgroundColor: '#181818',
    borderRadius: 12, // slightly smaller than wrapper to fit inside padding
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: 16 },
  cardTitle: { fontSize: 13, color: '#fff', fontWeight: 'bold', letterSpacing: 0.5, textAlign: 'right', flex: 1, marginRight: 8 },
  cardIcon: { fontSize: 24 },
  cardAmount: { fontSize: 26, fontWeight: 'bold', color: '#fff', width: '100%', textAlign: 'center' },
  currency: { fontSize: 14, fontWeight: 'normal', color: 'rgba(255,255,255,0.6)' },
  
  pendingBanner: {
    marginHorizontal: 16, marginTop: 16, padding: 12, borderRadius: 12,
    backgroundColor: 'rgba(243, 156, 18, 0.1)', borderWidth: 1, borderColor: 'rgba(243, 156, 18, 0.3)',
    alignItems: 'center'
  },
  pendingText: { color: '#f39c12', fontWeight: 'bold', fontSize: 14 },
  
  sectionHeader: { paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 10, opacity: 0.5 },
  emptyText: { color: COLORS.textMuted, fontSize: 16 },
  
  listContainer: { paddingHorizontal: 16 },

  toast: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.95)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  toastText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
})
