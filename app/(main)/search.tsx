import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, FlatList,
  StyleSheet, StatusBar, TouchableOpacity, Platform
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { Customer } from '../../lib/types'
import { COLORS } from '../../constants/colors'
import { STRINGS } from '../../constants/strings'
import CustomerCard from '../../components/CustomerCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import QuickLogModal from '../../components/QuickLogModal'
import { logout } from '../../lib/auth'

export default function SearchScreen() {
  const params = useLocalSearchParams<{ quickType?: string }>()
  const quickType = params.quickType as 'debt' | 'payment' | undefined

  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true) // Start loading for initial fetch
  const [isFocused, setIsFocused] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<TextInput>(null)

  // Modal State
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const loadTopCustomers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, balance_iqd, balance_usd')
        // Ordering by balance as a proxy for "most financial movement"
        .order('balance_iqd', { ascending: false })
        .limit(30)

      if (!error && data) {
        setCustomers(data as Customer[])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTopCustomers()
  }, [])

  // If quickType is set, auto-focus search and show banner
  useEffect(() => {
    if (quickType) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [quickType])

  const handleSearch = useCallback((text: string) => {
    setQuery(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (text.trim().length === 0) {
      loadTopCustomers()
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, phone, balance_iqd, balance_usd')
          .or(`name.ilike.%${text.trim()}%,phone.ilike.%${text.trim()}%`)
          .limit(30)
          .order('name')

        if (!error && data) {
          setCustomers(data as Customer[])
        }
      } finally {
        setLoading(false)
      }
    }, 150)
  }, [])

  // Removed handleLogout as it's now in the dashboard

  // When quickType is active, tapping a customer opens the floating modal
  const handleQuickSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setModalVisible(true)
  }

  const handleModalSuccess = () => {
    setModalVisible(false)
    router.replace('/(main)?success=true')
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header (Arabic Order: Title on Right, Subtitle on Left) */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>العملاء الأكثر حركة</Text>
        <Text style={styles.title}>{STRINGS.searchTitle}</Text>
      </View>

      {/* Quick Action Banner */}
      {quickType && (
        <View style={[styles.quickBanner, quickType === 'debt' ? styles.debtBanner : styles.paymentBanner]}>
          <Text style={[styles.quickBannerText, { color: quickType === 'debt' ? COLORS.red : COLORS.green }]}>
            {quickType === 'debt' ? '📉 اختر عميلاً لتسجيل دين' : '📈 اختر عميلاً لتسجيل سداد'}
          </Text>
        </View>
      )}

      {/* Smart Search Engine Input */}
      <View style={[styles.searchBox, isFocused && styles.searchBoxFocused]}>
        <TextInput
          ref={inputRef}
          // The combination of textAlign and writingDirection forces RTL on both Native and Web.
          // Using 'dir': 'rtl' is a web-specific trick to fix placeholder alignment.
          style={[styles.searchInput, { outlineStyle: 'none', writingDirection: 'rtl' } as any]}
          placeholder="ابحث عن عميل بالاسم أو الهاتف..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textAlign="right"
          returnKeyType="search"
          clearButtonMode="while-editing"
          {...Platform.select({ web: { dir: 'rtl' } })}
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : customers.length === 0 ? (
        <View style={styles.hintArea}>
          <Text style={styles.hintIcon}>🔎</Text>
          <Text style={styles.hintText}>{STRINGS.noResults}</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) =>
            quickType ? (
              // Quick mode: tapping anywhere on the card selects customer
              <TouchableOpacity onPress={() => handleQuickSelect(item)} activeOpacity={0.85}>
                <View pointerEvents="none">
                  <CustomerCard customer={item} />
                </View>
              </TouchableOpacity>
            ) : (
              <CustomerCard customer={item} />
            )
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Quick Action Modal */}
      {selectedCustomer && (
        <QuickLogModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          customer={selectedCustomer}
          presetType={quickType || 'debt'}
          onSuccess={handleModalSuccess}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.gold },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  quickBanner: {
    marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 12,
    borderWidth: 1, alignItems: 'center',
  },
  debtBanner: { backgroundColor: COLORS.redFaint, borderColor: 'rgba(231,76,60,0.3)' },
  paymentBanner: { backgroundColor: COLORS.greenFaint, borderColor: 'rgba(46,204,113,0.3)' },
  quickBannerText: { fontSize: 15, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginTop: 20, marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Base background
    borderRadius: 9999,
    paddingHorizontal: 20, paddingVertical: 12,
    // Add inner shadow effect for web, fallback to dark bg for mobile
    ...Platform.select({
      web: { boxShadow: 'inset 2px 5px 10px rgb(5, 5, 5)' },
      default: { backgroundColor: '#050505', borderColor: '#000', borderWidth: 1 }
    }) as any
  },
  searchBoxFocused: {
    ...Platform.select({
      web: { boxShadow: 'inset 2px 5px 10px rgb(5, 5, 5), 0px 0px 8px rgba(201, 162, 39, 0.3)' },
      default: { borderColor: COLORS.gold }
    }) as any
  },
  searchIcon: { fontSize: 20, opacity: 0.7 },
  searchInput: { 
    flex: 1, fontSize: 16, color: '#fff', fontWeight: '600',
    backgroundColor: 'transparent', borderWidth: 0
  },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  hintArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  hintIcon: { fontSize: 56 },
  hintText: { fontSize: 16, color: COLORS.textMuted },
})
