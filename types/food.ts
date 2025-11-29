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

// Réponse de GET /food-entries
export type FoodEntriesResponse = {
  entries: FoodEntry[]
}

// Payload pour POST /food-entries
export type CreateFoodEntryInput = {
  label: string
  calories?: number | null
  proteinGrams?: number | null
  carbsGrams?: number | null
  fatGrams?: number | null
  // optionnel côté front, géré côté back (input.loggedAt ?? new Date())
  loggedAt?: string
}

export type FoodDaySummary = {
  day: string // YYYY-MM-DD
  totalCalories: number
  inWindowCalories: number
  outWindowCalories: number
  entriesCount: number
}

// Réponse de GET /food-entries/summary
export type FoodSummaryResponse = {
  from: string
  to: string
  days: FoodDaySummary[]
}

// ... tes types existants (FoodEntry, etc.)

export type FoodItem = {
  id: string
  label: string
  brand: string | null
  servingSize: string | null
  calories: number | null
  proteinGrams: number | null
  carbsGrams: number | null
  fatGrams: number | null
  source: 'GLOBAL' | 'USER'
  createdAt: string
  updatedAt: string
}

export type FoodSearchResponse = {
  items: FoodItem[]
}
