import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Customer } from '../lib/types'
import { COLORS } from '../constants/colors'
import { STRINGS } from '../constants/strings'
import { router } from 'expo-router'

interface CustomerCardProps {
  customer: Customer
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US').format(Math.abs(amount))
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  const hasIqdBalance = customer.balance_iqd !== 0
  const hasUsdBalance = customer.balance_usd !== 0

  const handleLogEvent = () => {
    router.push({
      pathname: '/(main)/log-event',
      params: {
        customerId: customer.id,
        customerName: customer.name,
        balanceIqd: customer.balance_iqd,
        balanceUsd: customer.balance_usd,
      },
    })
  }

  return (
    <View style={styles.card}>
      {/* Customer Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{customer.name}</Text>
        {customer.phone && (
          <Text style={styles.phone}>{customer.phone}</Text>
        )}
      </View>

      {/* Balances */}
      <View style={styles.balances}>
        {hasIqdBalance && (
          <View style={[styles.badge, customer.balance_iqd > 0 ? styles.debtBadge : styles.creditBadge]}>
            <Text style={[styles.badgeText, customer.balance_iqd > 0 ? styles.debtText : styles.creditText]}>
              {customer.balance_iqd > 0 ? STRINGS.debtLabel : STRINGS.creditLabel}
              {'  '}
              {formatAmount(customer.balance_iqd)} د.ع
            </Text>
          </View>
        )}
        {hasUsdBalance && (
          <View style={[styles.badge, customer.balance_usd > 0 ? styles.debtBadge : styles.creditBadge]}>
            <Text style={[styles.badgeText, customer.balance_usd > 0 ? styles.debtText : styles.creditText]}>
              {customer.balance_usd > 0 ? STRINGS.debtLabel : STRINGS.creditLabel}
              {'  '}
              ${formatAmount(customer.balance_usd)}
            </Text>
          </View>
        )}
        {!hasIqdBalance && !hasUsdBalance && (
          <Text style={styles.zeroBalance}>لا يوجد رصيد</Text>
        )}
      </View>

      {/* Action Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogEvent} activeOpacity={0.8}>
        <Text style={styles.buttonText}>+ {STRINGS.logEventButton}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  info: { gap: 4 },
  name: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right' },
  phone: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right' },
  balances: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  debtBadge: { backgroundColor: COLORS.redFaint, borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)' },
  creditBadge: { backgroundColor: COLORS.greenFaint, borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)' },
  badgeText: { fontSize: 13, fontWeight: '600' },
  debtText: { color: COLORS.red },
  creditText: { color: COLORS.green },
  zeroBalance: { fontSize: 13, color: COLORS.textMuted, textAlign: 'right' },
  button: {
    backgroundColor: COLORS.goldFaint,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: { color: COLORS.gold, fontWeight: '700', fontSize: 15 },
})
