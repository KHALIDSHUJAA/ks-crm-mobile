import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { PhoneEvent } from '../lib/types'
import { COLORS } from '../constants/colors'
import { STRINGS } from '../constants/strings'

interface EventListProps {
  events: PhoneEvent[]
  onRefresh?: () => void
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })
}

function formatAmount(amount: number, currency: string): string {
  const num = new Intl.NumberFormat('en-US').format(amount)
  return currency === 'USD' ? `$${num}` : `${num} د.ع`
}

function getBadgeStyle(type: PhoneEvent['type']) {
  if (type === 'debt') return { badge: styles.debtBadge, text: styles.debtText, label: STRINGS.debtType }
  if (type === 'payment') return { badge: styles.paymentBadge, text: styles.paymentText, label: STRINGS.paymentType }
  return { badge: styles.newCustomerBadge, text: styles.newCustomerText, label: '🆕 عميل جديد' }
}

function getAmountStyle(type: PhoneEvent['type']) {
  if (type === 'debt') return styles.debtAmount
  if (type === 'payment') return styles.paymentAmount
  return styles.newCustomerAmount
}

export default function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyText}>{STRINGS.noEventsToday}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {events.map((event) => {
        const badge = getBadgeStyle(event.type)
        const isNewCustomer = event.type === 'new_customer'
        return (
          <View key={event.id} style={[styles.item, isNewCustomer && styles.newCustomerItem]}>
            <View style={styles.header}>
              <Text style={styles.time}>{formatTime(event.created_at)}</Text>
              <View style={[styles.typeBadge, badge.badge]}>
                <Text style={[styles.typeText, badge.text]}>{badge.label}</Text>
              </View>
            </View>
            <Text style={styles.customerName}>{event.customer_name}</Text>
            {isNewCustomer ? (
              <Text style={styles.newCustomerHint}>⏳ بانتظار الإضافة من الإدارة</Text>
            ) : (
              <Text style={[styles.amount, getAmountStyle(event.type)]}>
                {event.amount > 0 ? formatAmount(event.amount, event.currency) : '---'}
              </Text>
            )}
            {event.note && !isNewCustomer ? (
              <Text style={styles.note}>{event.note}</Text>
            ) : null}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  item: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  newCustomerItem: {
    borderColor: 'rgba(201,162,39,0.3)',
    backgroundColor: 'rgba(201,162,39,0.04)',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { fontSize: 12, color: COLORS.textMuted },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  debtBadge: { backgroundColor: COLORS.redFaint },
  paymentBadge: { backgroundColor: COLORS.greenFaint },
  newCustomerBadge: { backgroundColor: COLORS.goldFaint },
  typeText: { fontSize: 12, fontWeight: '700' },
  debtText: { color: COLORS.red },
  paymentText: { color: COLORS.green },
  newCustomerText: { color: COLORS.gold },
  customerName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right' },
  amount: { fontSize: 18, fontWeight: '800', textAlign: 'right' },
  debtAmount: { color: COLORS.red },
  paymentAmount: { color: COLORS.green },
  newCustomerAmount: { color: COLORS.gold },
  newCustomerHint: { fontSize: 12, color: COLORS.gold, opacity: 0.7, textAlign: 'right', fontStyle: 'italic' },
  note: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: COLORS.textMuted },
})
