import { Stack } from 'expo-router'
import { I18nManager, Platform } from 'react-native'
import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'

// Prevent the splash screen from auto-hiding before asset loading is complete.
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync()
}

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
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  })

  useEffect(() => {
    if (loaded || error) {
      if (Platform.OS !== 'web') {
        SplashScreen.hideAsync()
      }
    }
  }, [loaded, error])

  if (!loaded && !error) {
    return null
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
      </Stack>
    </>
  )
}
