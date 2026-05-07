import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { PhoneEvent } from '../lib/types'
import { COLORS } from '../constants/colors'
import { STRINGS } from '../constants/strings'

interface EventListProps {
  events: PhoneEvent[]
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })
}

function formatAmount(amount: number, currency: string): string {
  const num = new Intl.NumberFormat('en-US').format(amount)
  return currency === 'USD' ? `$${num}` : `${num} د.ع`
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
      {events.map((event) => (
        <View key={event.id} style={styles.item}>
          <View style={styles.header}>
            <Text style={styles.time}>{formatTime(event.created_at)}</Text>
            <View style={[styles.typeBadge, event.type === 'debt' ? styles.debtBadge : styles.paymentBadge]}>
              <Text style={[styles.typeText, event.type === 'debt' ? styles.debtText : styles.paymentText]}>
                {event.type === 'debt' ? STRINGS.debtType : STRINGS.paymentType}
              </Text>
            </View>
          </View>
          <Text style={styles.customerName}>{event.customer_name}</Text>
          <Text style={[styles.amount, event.type === 'debt' ? styles.debtAmount : styles.paymentAmount]}>
            {formatAmount(event.amount, event.currency)}
          </Text>
          {event.note ? (
            <Text style={styles.note}>{event.note}</Text>
          ) : null}
        </View>
      ))}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { fontSize: 12, color: COLORS.textMuted },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  debtBadge: { backgroundColor: COLORS.redFaint },
  paymentBadge: { backgroundColor: COLORS.greenFaint },
  typeText: { fontSize: 12, fontWeight: '700' },
  debtText: { color: COLORS.red },
  paymentText: { color: COLORS.green },
  customerName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right' },
  amount: { fontSize: 18, fontWeight: '800', textAlign: 'right' },
  debtAmount: { color: COLORS.red },
  paymentAmount: { color: COLORS.green },
  note: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'right' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: COLORS.textMuted },
})
