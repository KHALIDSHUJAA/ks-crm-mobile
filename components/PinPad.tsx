import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from 'react-native'
import { COLORS } from '../constants/colors'

I18nManager.allowRTL(true)
I18nManager.forceRTL(true)

interface PinPadProps {
  onPress: (digit: string) => void
  onDelete: () => void
}

const KEYS = [
  ['١', '٢', '٣'],
  ['٤', '٥', '٦'],
  ['٧', '٨', '٩'],
  ['', '٠', '⌫'],
]

const DIGIT_MAP: Record<string, string> = {
  '١': '1', '٢': '2', '٣': '3',
  '٤': '4', '٥': '5', '٦': '6',
  '٧': '7', '٨': '8', '٩': '9',
  '٠': '0',
}

export default function PinPad({ onPress, onDelete }: PinPadProps) {
  return (
    <View style={styles.container}>
      {KEYS.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((key, colIdx) => {
            if (key === '') return <View key={colIdx} style={styles.empty} />
            if (key === '⌫') {
              return (
                <TouchableOpacity
                  key={colIdx}
                  style={styles.deleteKey}
                  onPress={onDelete}
                  activeOpacity={0.6}
                >
                  <Text style={styles.deleteText}>⌫</Text>
                </TouchableOpacity>
              )
            }
            return (
              <TouchableOpacity
                key={colIdx}
                style={styles.key}
                onPress={() => onPress(DIGIT_MAP[key])}
                activeOpacity={0.6}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  row: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 28,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  deleteKey: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 24,
    color: COLORS.gold,
  },
  empty: { width: 80, height: 80 },
})
