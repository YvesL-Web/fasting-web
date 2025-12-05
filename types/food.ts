export type FoodEntry = {
  id: string
  label: string
  calories: number | null
  proteinGrams: number | null
  carbsGrams: number | null
  fatGrams: number | null
  loggedAt: string
  inEatingWindow: boolean
  isPostFast: boolean
  fastId: string | null
  recipe: FoodEntryRecipeRef | null
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
  recipeId?: string | null
}

export type FoodDaySummary = {
  day: string // YYYY-MM-DD
  totalCalories: number
  inWindowCalories: number
  outWindowCalories: number
  entriesCount: number
  postFastCalories: number
}

export type FoodTopRecipeSummary = {
  recipeId: string
  title: string
  imageUrl: string | null
  uses: number
  totalCalories: number
}

// Réponse de GET /food-entries/summary
export type FoodSummaryResponse = {
  from: string
  to: string
  days: FoodDaySummary[]
  topRecipes: FoodTopRecipeSummary[]
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

// Payload pour créer un aliment custom
export type CreateFoodItemInput = {
  label: string
  brand?: string | null
  servingSize?: string | null
  calories?: number | null
  proteinGrams?: number | null
  carbsGrams?: number | null
  fatGrams?: number | null
}

// Pour GET /foods (mes aliments)
export type UserFoodsResponse = {
  items: FoodItem[]
}

export type FoodEntryRecipeRef = {
  id: string
  title: string
  imageUrl: string | null
}
