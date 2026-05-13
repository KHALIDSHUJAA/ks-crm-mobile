// ============================
// Shared TypeScript types
// ============================

export interface Customer {
  id: number
  name: string
  phone: string | null
  balance_iqd: number
  balance_usd: number
}

export interface PhoneEvent {
  id: string
  customer_id: number
  customer_name: string
  type: 'debt' | 'payment' | 'new_customer'
  amount: number
  currency: 'IQD' | 'USD'
  note: string | null
  created_at: string
  status: 'pending' | 'transferred'
  employee_id: string
}

export type Currency = 'IQD' | 'USD'
export type EventType = 'debt' | 'payment' | 'new_customer'
