import { describe, expect, it } from 'vitest'
import { parseWorkoutScan, type OcrLine } from './workout-scan'

const TODAY = new Date(2026, 10, 22, 18, 30)

const GLYPH = { width: 10, lineHeight: 24, textHeight: 16 } as const

function screenshot(layout: string): OcrLine[] {
  return layout.split('\n').flatMap((row, rowIndex) =>
    [...row.matchAll(/\S+(?: \S+)*/g)].map((match) => ({
      text: match[0],
      box: {
        x: match.index * GLYPH.width,
        y: rowIndex * GLYPH.lineHeight,
        width: match[0].length * GLYPH.width,
        height: GLYPH.textHeight,
      },
    })),
  )
}

function scan(layout: string) {
  return parseWorkoutScan({ lines: screenshot(layout), today: TODAY })
}

describe('parseWorkoutScan', () => {
  it('reads a Strava run with labels above values in a three-column grid', () => {
    const result = scan(`
Morning Run
November 22, 2026 at 7:12 AM · Zurich, Switzerland

Distance          Avg Pace          Moving Time
10.02 km          4:54 /km          49:05

Elevation Gain    Calories          Avg Heart Rate
52 m              712               152 bpm

Elapsed Time
52:30
`)
    expect(result).toEqual({
      activity: 'run',
      distanceMeters: 10_020,
      durationSeconds: 2945,
      date: new Date(2026, 10, 22),
      avgHeartRate: 152,
      calories: 712,
      elevationGainMeters: 52,
    })
  })

  it('reads a Garmin trail run with values above labels and skips max HR', () => {
    const result = scan(`
Trail Running
Sat, Nov 22 @ 7:12 AM

12.41 km          1:18:42
Distance          Time

6:20 /km          845 m
Avg Pace          Total Ascent

178 bpm           152 bpm
Max HR            Avg HR

1,024
Calories
`)
    expect(result).toEqual({
      activity: 'trail-run',
      distanceMeters: 12_410,
      durationSeconds: 4722,
      date: new Date(2026, 10, 22),
      avgHeartRate: 152,
      calories: 1024,
      elevationGainMeters: 845,
    })
  })

  it('reads a Garmin pool swim laid out as a label-value list', () => {
    const result = scan(`
Pool Swim
22.11.2026 07:12

Distance                     1,250 m
Time                         49:05
Avg Pace                     3:56 /100m
Avg HR                       128 bpm
Calories                     412
`)
    expect(result).toEqual({
      activity: 'pool-swim',
      distanceMeters: 1250,
      durationSeconds: 2945,
      date: new Date(2026, 10, 22),
      avgHeartRate: 128,
      calories: 412,
    })
  })

  it('reads an Apple Fitness open water swim with units glued to the values', () => {
    const result = scan(`
Open Water Swim
Sat 21 Nov 2026

Workout Time          Distance
0:42:10               1.85KM

Active Kilocalories   Total Kilocalories
389KCAL               452KCAL

Avg. Heart Rate       Avg. Pace
141BPM                2'17''/100M
`)
    expect(result).toEqual({
      activity: 'open-water-swim',
      distanceMeters: 1850,
      durationSeconds: 2530,
      date: new Date(2026, 10, 21),
      avgHeartRate: 141,
      calories: 389,
    })
  })

  it('converts a US ride in miles and feet and reads "Yesterday"', () => {
    const result = scan(`
Afternoon Ride
Yesterday at 4:05 PM

Distance        Elev Gain       Moving Time
24.86 mi        1,214 ft        1:18:42

Avg Speed       Calories        Avg Heart Rate
18.9 mph        845             138 bpm
`)
    expect(result.activity).toBe('ride')
    expect(result.distanceMeters).toBeCloseTo(40_008.29, 1)
    expect(result.elevationGainMeters).toBe(370)
    expect(result.durationSeconds).toBe(4722)
    expect(result.date).toEqual(new Date(2026, 10, 21))
    expect(result.avgHeartRate).toBe(138)
    expect(result.calories).toBe(845)
  })

  it('reads an unlabelled rowing summary from units alone, ignoring the split', () => {
    const result = scan(`
Indoor Rowing
Nov 21, 2026

5,000m
20:41.3
2:04.1 /500m
`)
    expect(result).toEqual({
      activity: 'row',
      distanceMeters: 5000,
      durationSeconds: 1241,
      date: new Date(2026, 10, 21),
    })
  })

  it('prefers moving time over elapsed time and ignores a lone max HR', () => {
    const result = scan(`
Hike
21 November 2026

Elapsed Time   4:05:12
Moving Time    3:12:40
Distance       12.4 km
Elevation      845 m
Max HR         171 bpm
`)
    expect(result).toEqual({
      activity: 'hike',
      distanceMeters: 12_400,
      durationSeconds: 11_560,
      date: new Date(2026, 10, 21),
      elevationGainMeters: 845,
    })
  })

  it('reads decimal commas and unit-only values when labels are in another language', () => {
    const result = scan(`
Lauf
22.11.2026
10,02 km
49:05
152 bpm
`)
    expect(result).toEqual({
      distanceMeters: 10_020,
      durationSeconds: 2945,
      date: new Date(2026, 10, 22),
      avgHeartRate: 152,
    })
  })

  it('never takes the time of day as the workout duration', () => {
    const result = scan(`
Evening Walk
Today at 6:40 PM

Distance
5.2 km
`)
    expect(result).toEqual({
      activity: 'walk',
      distanceMeters: 5200,
      date: new Date(2026, 10, 22),
    })
  })

  it('ignores a pace whose slash the OCR dropped, so it is not taken as the time', () => {
    const result = scan(`
Morning Run
10.02 km
4:54 km
49:05
`)
    expect(result.durationSeconds).toBe(2945)
  })

  it('reads the Garmin Connect summary ML Kit returned on the emulator', () => {
    const lines = [
      {
        text: 'Saturday, 21 November 2026 07:42',
        box: { x: 57, y: 81, width: 488, height: 32 },
      },
      { text: 'Morning Run', box: { x: 59, y: 135, width: 361, height: 66 } },
      { text: 'Distance', box: { x: 58, y: 261, width: 97, height: 20 } },
      { text: '10.02 km', box: { x: 60, y: 297, width: 246, height: 45 } },
      { text: 'Avg Pace', box: { x: 56, y: 412, width: 108, height: 28 } },
      { text: '4:54 km', box: { x: 57, y: 451, width: 236, height: 46 } },
      { text: 'Calories', box: { x: 57, y: 570, width: 94, height: 21 } },
      { text: '640 kcal', box: { x: 58, y: 607, width: 228, height: 45 } },
      { text: 'Time', box: { x: 540, y: 261, width: 56, height: 19 } },
      { text: '49:05', box: { x: 541, y: 298, width: 150, height: 44 } },
      { text: 'Avg Heart Rate', box: { x: 540, y: 412, width: 174, height: 27 } },
      { text: '152 bpm', box: { x: 543, y: 445, width: 238, height: 66 } },
      { text: 'Elevation Gain', box: { x: 542, y: 570, width: 166, height: 21 } },
      { text: '86 m', box: { x: 540, y: 603, width: 132, height: 54 } },
    ]
    expect(parseWorkoutScan({ lines, today: TODAY })).toEqual({
      activity: 'run',
      distanceMeters: 10_020,
      durationSeconds: 2945,
      date: new Date(2026, 10, 21),
      avgHeartRate: 152,
      calories: 640,
      elevationGainMeters: 86,
    })
  })

  it('reads durations written with h, m and s', () => {
    expect(scan('Time 1h 02m 33s').durationSeconds).toBe(3753)
    expect(scan('Moving Time 49m 5s').durationSeconds).toBe(2945)
    expect(scan('Duration 38 min').durationSeconds).toBe(2280)
  })

  it('drops heart rates and calories outside a believable range', () => {
    const result = scan(`
Avg HR      12
Calories    0
`)
    expect(result.avgHeartRate).toBeUndefined()
    expect(result.calories).toBeUndefined()
  })

  it('finds nothing in a screenshot without workout stats', () => {
    expect(
      scan(`
Activities
Following      You
Give kudos to your friends
`),
    ).toEqual({})
  })

  it('keeps an unlabelled meter distance only for sports measured in meters', () => {
    expect(scan('Morning Run\n800 m').distanceMeters).toBeUndefined()
    expect(scan('Pool Swim\n800 m').distanceMeters).toBe(800)
  })

  it('reads a low-resolution Garmin run, skipping the status bar clock', () => {
    const result = scan(`
9:41
Running

3.24.
Distance

165 bpm          12:12 mi
Avg Heart Rate   vg Pace

39:29            397
Tota ime.        Total Calories
`)
    expect(result).toEqual({
      activity: 'run',
      distanceMeters: 3.24 * 1609.344,
      durationSeconds: 2369,
      avgHeartRate: 165,
      calories: 397,
    })
  })

  it('reads a bare distance under its label in the sport unit when the page has no miles', () => {
    expect(scan('Morning Run\n10.02\nDistance\n4:54 /km').distanceMeters).toBe(10_020)
    expect(scan('Pool Swim\n1,250\nDistance').distanceMeters).toBe(1250)
  })

  it('takes the sport from the pace unit when the screen never names it', () => {
    const result = scan(`
Congrats! You just set your 3rd fastest time in the 10k!

Distance          Avg Pace
10.01 km          5:21 /km

Moving Time       Elevation Gain
53:37             118 m

Calories          Avg Cadence
839 Cal           167 spm
`)
    expect(result).toEqual({
      activity: 'run',
      distanceMeters: 10_010,
      durationSeconds: 3217,
      calories: 839,
      elevationGainMeters: 118,
    })
    expect(scan('Distance\n1,250 m\nPace\n1:58 /100m').activity).toBe('pool-swim')
    expect(scan('Distance\n42.3 km\nAvg Speed\n28.4 km/h').activity).toBe('ride')
  })
})
