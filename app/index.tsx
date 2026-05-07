import { useEffect } from 'react'
import { router } from 'expo-router'
import { supabase } from '../lib/supabase'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Index() {
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.replace('/(auth)/login')
        } else {
          router.replace('/(auth)/lock')
        }
      } catch {
        router.replace('/(auth)/login')
      }
    }
    bootstrap()
  }, [])

  return <LoadingSpinner fullScreen />
}
