export type FoodEntry = {
  id: string
  label: string
  calories: number | null
  proteinGrams: number | null
  carbsGrams: number | null
  fatGrams: number | null
  loggedAt: string
  inEatingWindow: boolean
  fastId: string | null
  createdAt: string
  updatedAt: string
}

export type FoodEntriesResponse = {
  entries: FoodEntry[]
}

export type CreateFoodEntryInput = {
  label: string
  calories?: number | null
  proteinGrams?: number | null
  carbsGrams?: number | null
  fatGrams?: number | null
}

export type FoodDaySummary = {
  day: string // YYYY-MM-DD
  totalCalories: number
  inWindowCalories: number
  outWindowCalories: number
  entriesCount: number
}

export type FoodSummaryResponse = {
  from: string
  to: string
  days: FoodDaySummary[]
}
