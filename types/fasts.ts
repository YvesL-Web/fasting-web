export type Fast = {
  id: string
  type: string
  startAt: string
  endAt: string | null
  notes: string | null
  targetDurationHours: number | null
  fastTargetEndAt: string | null
  eatingWindowStartAt: string | null
  eatingWindowEndAt: string | null
  createdAt: string
  updatedAt: string
}

export type Stats = {
  totalFasts: number
  totalHours: number
  averageHours: number
  longestFastHours: number
  currentStreakDays: number
}

export type FastingPreset = {
  id: string
  label: string
  fastingHours: number
  eatingHours: number
}

export type PresetsResponse = {
  presets: FastingPreset[]
}

export type StartFastInput = {
  type: string
  notes?: string | null
  targetDurationHours?: number | null
  eatingHours?: number | null
}
