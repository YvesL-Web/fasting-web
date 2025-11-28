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
