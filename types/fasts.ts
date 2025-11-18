export type Fast = {
  id: string
  type: string
  startAt: string
  endAt: string | null
  notes: string | null
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
