import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { COLORS } from '../constants/colors'

interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  fullScreen?: boolean
}

export default function LoadingSpinner({ size = 'large', fullScreen = false }: LoadingSpinnerProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={COLORS.gold} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  fullScreen: { flex: 1, backgroundColor: COLORS.bg },
})
