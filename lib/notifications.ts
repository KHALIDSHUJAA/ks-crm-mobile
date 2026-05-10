import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { supabase } from './supabase'

// Configure notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export async function registerForPushNotificationsAsync() {
  let token

  if (Platform.OS === 'web') {
    return null
  }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    console.log('[Push] Initial permission status:', existingStatus)
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
      console.log('[Push] Requested permission status:', status)
    }
    if (finalStatus !== 'granted') {
      console.warn('[Push] Permission not granted!')
      return null
    }
    
    try {
        const projectId = '79d87d31-fc1a-414c-aa2b-b13ef9df913b'
        console.log('[Push] Getting token for Project ID:', projectId)
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data
        console.log('[Push] Token received:', token)
    } catch (e) {
        console.error('[Push] Error getting push token:', e)
        return null
    }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    })
  }

  return token
}

export async function savePushToken(userId: string, token: string) {
  try {
    console.log(`[Push] Attempting to save token for user: ${userId}`)
    const { error } = await supabase
      .from('user_push_tokens')
      .upsert({ 
        user_id: userId, 
        push_token: token, 
        platform: Platform.OS,
        updated_at: new Date().toISOString()
      }, { onConflict: 'push_token' })

    if (error) {
        console.error('[Push] Database error saving token:', error.message)
    } else {
        console.log('[Push] Token saved successfully to Supabase! ✅')
    }
  } catch (e: any) {
    console.error('[Push] Exception saving push token:', e.message)
  }
}

export async function sendPushNotification(title: string, body: string, data = {}) {
  try {
    // 1. Fetch all admin tokens from Supabase
    // We assume admins have a role or we just send to everyone who registered as admin
    // For now, let's fetch tokens from 'user_push_tokens' 
    // In a real app, we'd filter by user role.
    const { data: tokens, error } = await supabase
      .from('user_push_tokens')
      .select('push_token')

    if (error || !tokens || tokens.length === 0) {
      console.log('[Push] No tokens found in database')
      return
    }

    console.log(`[Push] Sending to ${tokens.length} devices...`)
    // Alert.alert('إشعار', `جاري الإرسال إلى ${tokens.length} أجهزة...`)

    const messages = tokens.map(t => ({
      to: t.push_token,
      sound: 'default',
      title,
      body,
      data,
    }))

    // 2. Send to Expo Push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    if (!response.ok) {
        const err = await response.text()
        console.error('[Push] Expo API Error:', err)
    } else {
        console.log('[Push] Notification sent successfully!')
    }
  } catch (e: any) {
    console.error('[Push] Error sending push notification:', e.message)
    Alert.alert('خطأ في الإشعار', e.message)
  }
}
