export type FoodScanSuggestion = {
  label: string
  calories?: number | null
  proteinGrams?: number | null
  carbsGrams?: number | null
  fatGrams?: number | null
  confidence: number
}

export type FoodScanResponse = {
  suggestions: FoodScanSuggestion[]
  createdItemIds: string[]
}
