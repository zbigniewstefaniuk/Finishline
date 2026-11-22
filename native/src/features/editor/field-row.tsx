import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SPACE } from '~/theme/tokens'
import { useTheme } from '~/theme/use-theme'

const UNIT_COLUMN_WIDTH = 40

export function FieldRow({
  label,
  unit,
  error,
  hasSeparator,
  children,
}: {
  label: string
  unit?: string
  error?: string
  hasSeparator: boolean
  children: ReactNode
}) {
  const theme = useTheme()
  return (
    <View
      style={[
        styles.row,
        hasSeparator && { borderBottomColor: theme.hairline, borderBottomWidth: 1 },
      ]}
    >
      <View style={styles.rowLine}>
        <Text style={[styles.label, { color: theme.ink }]}>{label}</Text>
        <View style={styles.valueGroup}>
          {children}
          {unit === undefined ? null : (
            <Text style={[styles.unit, { color: theme.muted }]}>{unit}</Text>
          )}
        </View>
      </View>
      {error ? (
        <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: SPACE.row,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  rowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
  },
  valueGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unit: {
    minWidth: UNIT_COLUMN_WIDTH,
    fontSize: 15,
  },
  error: {
    marginTop: 4,
    fontSize: 13,
  },
})
