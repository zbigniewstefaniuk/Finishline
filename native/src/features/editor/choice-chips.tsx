import { Pressable, StyleSheet, Text, View } from 'react-native'
import { PRESSED_OPACITY, RADIUS } from '~/theme/tokens'
import { useTheme } from '~/theme/use-theme'

export function ChoiceChips<Value extends string>({
  values,
  labels,
  value,
  accessibilityLabel,
  onChange,
}: {
  values: readonly Value[]
  labels: Record<Value, string>
  value: Value
  accessibilityLabel: string
  onChange: (value: Value) => void
}) {
  const theme = useTheme()
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={styles.row}
    >
      {values.map((option) => {
        const isActive = option === value
        return (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ checked: isActive }}
            onPress={() => onChange(option)}
            style={({ pressed }) => [
              styles.chip,
              { backgroundColor: isActive ? theme.tint : theme.raised },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.label, { color: isActive ? theme.ink : theme.muted }]}>
              {labels[option]}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    height: 34,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
})
