import { Tabs } from 'expo-router'
import { useEffect } from 'react'
import { COLORS } from '../../constants/colors'
import { STRINGS } from '../../constants/strings'
import CustomTabBar from '../../components/CustomTabBar'
import { registerForPushNotificationsAsync, savePushToken } from '../../lib/notifications'
import { supabase } from '../../lib/supabase'

export default function MainLayout() {
  useEffect(() => {
    const setupNotifications = async () => {
      const token = await registerForPushNotificationsAsync()
      if (token) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await savePushToken(user.id, token)
        }
      }
    }
    setupNotifications()
  }, [])

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
      sceneContainerStyle={{ backgroundColor: '#000' }}
    >
      <Tabs.Screen
        name="settings"
        options={{ title: 'إعدادات' }}
      />
      <Tabs.Screen
        name="index"
        options={{ title: 'الرئيسية' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'البروفايل' }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: 'العملاء' }}
      />
      <Tabs.Screen
        name="log-event"
        options={{ href: null }}
      />
    </Tabs>
  )
}
