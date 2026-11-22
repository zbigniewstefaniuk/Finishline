import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker'
import { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, useColorScheme } from 'react-native'
import { formatDate } from '~/domain/format'
import { PRESSED_OPACITY } from '~/theme/tokens'
import { useTheme } from '~/theme/use-theme'

export function DateField({
  value,
  onChange,
}: {
  value: Date
  onChange: (date: Date) => void
}) {
  const theme = useTheme()
  const scheme = useColorScheme()
  const [today] = useState(() => new Date())

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="compact"
        maximumDate={today}
        themeVariant={scheme === 'light' ? 'light' : 'dark'}
        accentColor={theme.ink}
        onChange={(_event, date) => {
          if (date) onChange(date)
        }}
      />
    )
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Date, ${formatDate(value)}`}
      onPress={() =>
        DateTimePickerAndroid.open({
          value,
          mode: 'date',
          maximumDate: today,
          onChange: (event, date) => {
            if (event.type === 'set' && date) onChange(date)
          },
        })
      }
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.raised },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: theme.ink }]}>{formatDate(value)}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    height: 34,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
})
