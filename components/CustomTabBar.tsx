import React, { useState, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Pressable, Platform,
} from 'react-native'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants/colors'

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [fabOpen, setFabOpen] = useState(false)
  const scaleAnim = useRef(new Animated.Value(0)).current
  const insets = useSafeAreaInsets()

  const toggleFab = () => {
    if (fabOpen) {
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 30,
        bounciness: 0,
      }).start()
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }).start()
    }
    setFabOpen(!fabOpen)
  }

  const closeFab = () => {
    Animated.spring(scaleAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start()
    setFabOpen(false)
  }

  const handleQuickAction = (type: 'debt' | 'payment') => {
    closeFab()
    // Navigate to search with quick action mode
    router.push({ pathname: '/(main)/search', params: { quickType: type } })
  }

  // Visible tabs only (exclude log-event)
  const visibleRoutes = state.routes.filter(
    r => descriptors[r.key].options.href !== null
  )

  const tabBarHeight = 60 + insets.bottom

  const getTabIcon = (name: string, isFocused: boolean) => {
    const size = 26
    const isWeb = Platform.OS === 'web'

    if (name === 'search') {
      const color = isFocused ? COLORS.gold : COLORS.textMuted
      if (isWeb) return <Text style={{ fontSize: 24 }}>👥</Text>
      return <Ionicons name={isFocused ? "people" : "people-outline"} size={size} color={color} />
    }
    if (name === 'profile') {
      const color = isFocused ? COLORS.gold : COLORS.textMuted
      if (isWeb) return <Text style={{ fontSize: 24 }}>👤</Text>
      return <Ionicons name={isFocused ? "person-circle" : "person-circle-outline"} size={size + 2} color={color} />
    }
    if (name === 'index') {
      const color = isFocused ? COLORS.gold : COLORS.textMuted
      if (isWeb) return <Text style={{ fontSize: 24 }}>🏠</Text>
      return <Ionicons name={isFocused ? "home" : "home-outline"} size={size} color={color} />
    }
    if (name === 'settings') {
      const color = isFocused ? COLORS.gold : COLORS.textMuted
      if (isWeb) return <Text style={{ fontSize: 24 }}>⚙️</Text>
      return <Ionicons name={isFocused ? "settings" : "settings-outline"} size={size} color={color} />
    }
    return <Ionicons name="list" size={size} color={COLORS.textMuted} />
  }

  const getTabColor = (name: string, isFocused: boolean) => {
    if (!isFocused) return COLORS.textMuted
    return COLORS.gold
  }

  // Remove any unwanted hidden routes from visibleRoutes
  const validRoutes = visibleRoutes.filter(r => r.name !== 'log-event')

  // Explicitly arrange tabs for LTR rendering (visual layout)
  // Left side: Settings (Far Left), Customers (Mid Left)
  const leftSideTabs = validRoutes.filter(r => ['settings', 'search'].includes(r.name))
    .sort((a, b) => a.name === 'settings' ? -1 : 1) // settings first, then search

  // Right side: Profile (Mid Right), Home (Far Right)
  const rightSideTabs = validRoutes.filter(r => ['profile', 'index'].includes(r.name))
    .sort((a, b) => a.name === 'profile' ? -1 : 1) // profile first, then index

  return (
    <>
      {/* Backdrop to close FAB when tapping outside */}
      {fabOpen && (
        <Pressable style={styles.backdrop} onPress={closeFab} />
      )}

      {/* FAB Action Buttons */}
      <Animated.View
        style={[
          styles.fabActions,
          { bottom: tabBarHeight + 12 },
          {
            opacity: scaleAnim,
            transform: [{ scale: scaleAnim }, {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              })
            }],
          },
        ]}
        pointerEvents={fabOpen ? 'auto' : 'none'}
      >
        {/* Debt Button — Red (Right in RTL) */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.debtBtn]}
          onPress={() => handleQuickAction('debt')}
          activeOpacity={0.85}
        >
          <Text style={styles.actionIcon}>📉</Text>
          <Text style={styles.actionLabel}>دين</Text>
        </TouchableOpacity>

        {/* Payment Button — Green (Left in RTL) */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.paymentBtn]}
          onPress={() => handleQuickAction('payment')}
          activeOpacity={0.85}
        >
          <Text style={styles.actionIcon}>📈</Text>
          <Text style={styles.actionLabel}>سداد</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { height: tabBarHeight, paddingBottom: insets.bottom }]}>

        {/* Left side tabs */}
        {leftSideTabs.map((route) => {
          const isFocused = state.index === state.routes.indexOf(route)
          const { options } = descriptors[route.key]
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={() => {
                closeFab()
                navigation.navigate(route.name)
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isFocused && {
                shadowColor: getTabColor(route.name, isFocused),
                shadowOpacity: 0.8,
                shadowRadius: 10,
                elevation: 5
              }]}>
                {getTabIcon(route.name, isFocused)}
              </View>
              <Text style={[styles.tabLabel, { color: getTabColor(route.name, isFocused), opacity: isFocused ? 1 : 0.8 }]}>
                {String(options.title || route.name)}
              </Text>
            </TouchableOpacity>
          )
        })}

        {/* Center FAB */}
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={[styles.fab, fabOpen && styles.fabActive]}
            onPress={toggleFab}
            activeOpacity={0.85}
          >
            <Text style={[styles.fabIcon, fabOpen && styles.fabIconActive]}>
              {fabOpen ? '✕' : '⚡'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.tabLabel, { color: fabOpen ? COLORS.gold : COLORS.textMuted }]}>
            العمليات
          </Text>
        </View>

        {/* Right side tabs */}
        {rightSideTabs.map((route) => {
          const isFocused = state.index === state.routes.indexOf(route)
          const { options } = descriptors[route.key]
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={() => {
                closeFab()
                navigation.navigate(route.name)
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isFocused && {
                shadowColor: getTabColor(route.name, isFocused),
                shadowOpacity: 0.8,
                shadowRadius: 10,
                elevation: 5
              }]}>
                {getTabIcon(route.name, isFocused)}
              </View>
              <Text style={[styles.tabLabel, { color: getTabColor(route.name, isFocused), opacity: isFocused ? 1 : 0.8 }]}>
                {String(options.title || route.name)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    zIndex: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 4,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  fabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: -20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 2,
    borderColor: COLORS.goldLight,
  },
  fabActive: {
    backgroundColor: '#333',
    borderColor: COLORS.border,
    shadowOpacity: 0,
  },
  fabIcon: {
    fontSize: 24,
    color: '#000',
  },
  fabIconActive: {
    color: COLORS.textSecondary,
    fontSize: 20,
  },

  // FAB Action Buttons
  fabActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 20,
    zIndex: 30,
  },
  actionBtn: {
    width: 90,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  debtBtn: {
    backgroundColor: '#c0392b',
    shadowColor: '#e74c3c',
    borderWidth: 1.5,
    borderColor: 'rgba(231,76,60,0.6)',
  },
  paymentBtn: {
    backgroundColor: '#27ae60',
    shadowColor: '#2ecc71',
    borderWidth: 1.5,
    borderColor: 'rgba(46,204,113,0.6)',
  },
  actionIcon: {
    fontSize: 26,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
})
