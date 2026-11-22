import { useState, type ReactNode } from 'react'
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  HEALTH_LOOKBACK_DAYS,
  describeHealthWorkout,
  type HealthWorkout,
} from '~/domain/health-workout'
import {
  checkHealthAccess,
  openHealthConnect,
  openHealthConnectStore,
  readRecentWorkouts,
  requestHealthAccess,
} from '~/health/health-connect'
import { PRESSED_OPACITY, RADIUS, SPACE } from '~/theme/tokens'
import { useTheme } from '~/theme/use-theme'

type HealthState =
  | { kind: 'checking' }
  | { kind: 'not-connected' }
  | { kind: 'connecting' }
  | { kind: 'loading' }
  | { kind: 'ready'; workouts: HealthWorkout[] }
  | { kind: 'denied' }
  | { kind: 'needs-update' }
  | { kind: 'unavailable' }
  | { kind: 'failed'; message: string }

const BUSY_LABELS = {
  checking: 'Checking Health Connect…',
  connecting: 'Waiting for Health Connect…',
  loading: 'Loading your workouts…',
} as const

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.'
}

function SheetButton({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme()
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.primary },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonLabel, { color: theme.onPrimary }]}>{label}</Text>
    </Pressable>
  )
}

function HealthMessage({ text, children }: { text: string; children?: ReactNode }) {
  const theme = useTheme()
  return (
    <View style={styles.message}>
      <Text style={[styles.body, { color: theme.muted }]}>{text}</Text>
      {children}
    </View>
  )
}

function WorkoutRow({
  workout,
  hasSeparator,
  onPick,
}: {
  workout: HealthWorkout
  hasSeparator: boolean
  onPick: (workout: HealthWorkout) => void
}) {
  const theme = useTheme()
  const { title, detail } = describeHealthWorkout(workout)
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${detail}`}
      onPress={() => onPick(workout)}
      style={({ pressed }) => [
        styles.row,
        hasSeparator && { borderBottomColor: theme.hairline, borderBottomWidth: 1 },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.rowTitle, { color: theme.ink }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.rowDetail, { color: theme.muted }]}>{detail}</Text>
    </Pressable>
  )
}

function HealthSection({
  health,
  onConnect,
  onRetry,
  onPick,
}: {
  health: HealthState
  onConnect: () => void
  onRetry: () => void
  onPick: (workout: HealthWorkout) => void
}) {
  const theme = useTheme()
  switch (health.kind) {
    case 'checking':
    case 'connecting':
    case 'loading': {
      return (
        <View style={styles.busy}>
          <ActivityIndicator color={theme.muted} />
          <Text style={[styles.body, { color: theme.muted }]}>
            {BUSY_LABELS[health.kind]}
          </Text>
        </View>
      )
    }
    case 'not-connected': {
      return (
        <HealthMessage text="Pick a recent workout from Garmin, Strava or any app that syncs to Health Connect. Finishline only reads it.">
          <SheetButton label="Connect Health Connect" onPress={onConnect} />
        </HealthMessage>
      )
    }
    case 'denied': {
      return (
        <HealthMessage text="Finishline can't read your workouts yet. Allow exercise data for Finishline in Health Connect.">
          <SheetButton label="Open Health Connect" onPress={openHealthConnect} />
        </HealthMessage>
      )
    }
    case 'needs-update': {
      return (
        <HealthMessage text="Health Connect needs an update before Finishline can read workouts.">
          <SheetButton
            label="Update in Play Store"
            onPress={() => void openHealthConnectStore()}
          />
        </HealthMessage>
      )
    }
    case 'unavailable': {
      return <HealthMessage text="Health Connect isn't available on this phone." />
    }
    case 'failed': {
      return (
        <HealthMessage text={`Couldn't load workouts. ${health.message}`}>
          <SheetButton label="Try again" onPress={onRetry} />
        </HealthMessage>
      )
    }
    case 'ready': {
      if (health.workouts.length === 0) {
        return (
          <HealthMessage
            text={`No workouts in Health Connect from the last ${HEALTH_LOOKBACK_DAYS} days.`}
          />
        )
      }
      return (
        <ScrollView style={styles.list}>
          {health.workouts.map((workout, index) => (
            <WorkoutRow
              key={workout.id}
              workout={workout}
              hasSeparator={index < health.workouts.length - 1}
              onPick={onPick}
            />
          ))}
        </ScrollView>
      )
    }
  }
}

export function ImportSheet({
  visible,
  onClose,
  onPickWorkout,
  onUpload,
}: {
  visible: boolean
  onClose: () => void
  onPickWorkout: (workout: HealthWorkout) => void
  onUpload: () => void
}) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const [health, setHealth] = useState<HealthState>({ kind: 'checking' })

  async function loadWorkouts() {
    setHealth({ kind: 'loading' })
    setHealth({ kind: 'ready', workouts: await readRecentWorkouts(new Date()) })
  }

  async function checkAndLoad() {
    setHealth({ kind: 'checking' })
    try {
      const access = await checkHealthAccess()
      if (access !== 'connected') {
        setHealth({ kind: access })
        return
      }
      await loadWorkouts()
    } catch (error) {
      setHealth({ kind: 'failed', message: messageOf(error) })
    }
  }

  async function connect() {
    setHealth({ kind: 'connecting' })
    try {
      const isGranted = await requestHealthAccess()
      if (!isGranted) {
        setHealth({ kind: 'denied' })
        return
      }
      await loadWorkouts()
    } catch (error) {
      setHealth({ kind: 'failed', message: messageOf(error) })
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onShow={() => void checkAndLoad()}
      onRequestClose={onClose}
    >
      <View style={[styles.scrim, { backgroundColor: theme.scrim }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close import"
          style={styles.dismissArea}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              paddingBottom: insets.bottom + SPACE.stack,
            },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: theme.hairline }]} />
          <Text style={[styles.title, { color: theme.ink }]}>Import a workout</Text>

          <Text style={[styles.heading, { color: theme.muted }]}>
            {`Health Connect · last ${HEALTH_LOOKBACK_DAYS} days`}
          </Text>
          <HealthSection
            health={health}
            onConnect={() => void connect()}
            onRetry={() => void checkAndLoad()}
            onPick={onPickWorkout}
          />

          <Text style={[styles.heading, { color: theme.muted }]}>Screenshot</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onUpload}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <Text style={[styles.rowTitle, { color: theme.ink }]}>Upload screenshot</Text>
            <Text style={[styles.rowDetail, { color: theme.muted }]}>
              Read the stats from a workout summary image
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    maxHeight: '80%',
    paddingTop: 8,
    paddingHorizontal: SPACE.gutter + 4,
    borderTopLeftRadius: RADIUS.card,
    borderTopRightRadius: RADIUS.card,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: RADIUS.pill,
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  heading: {
    marginTop: 22,
    marginBottom: 4,
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    flexGrow: 0,
  },
  row: {
    minHeight: SPACE.row + 8,
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 2,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowDetail: {
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
  message: {
    paddingVertical: 8,
    gap: 14,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
  },
  busy: {
    minHeight: SPACE.row + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    height: SPACE.touch + 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.control,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
})
