import { Tabs } from 'expo-router'
import { COLORS } from '../../constants/colors'
import { STRINGS } from '../../constants/strings'
import CustomTabBar from '../../components/CustomTabBar'

export default function MainLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
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
