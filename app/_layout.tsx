import { Stack } from 'expo-router'
import { I18nManager, Platform } from 'react-native'

I18nManager.allowRTL(true)
I18nManager.forceRTL(true)

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  // Force the Apple SF Arabic (San Francisco) font family globally on Web
  const style = document.createElement('style')
  style.type = 'text/css'
  style.appendChild(document.createTextNode(`
    * {
      font-family: -apple-system, BlinkMacSystemFont, "SF Arabic", "SF Pro Arabic", "San Francisco", "Helvetica Neue", Helvetica, Arial, sans-serif !important;
    }
  `))
  document.head.appendChild(style)
}

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(main)" />
    </Stack>
  )
}
