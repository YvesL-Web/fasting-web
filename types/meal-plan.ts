export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'

export type MealPlanMeal = {
  mealType: MealType
  title: string
  description: string
  calories: number
  proteinGrams?: number | null
  carbsGrams?: number | null
  fatGrams?: number | null
  ingredients: string[]
  steps: string[]
  notes?: string | null
}

export type MealPlanDay = {
  dayIndex: number
  label: string
  totalCalories: number
  meals: MealPlanMeal[]
}

export type MealPlan = {
  goal: 'WEIGHT_LOSS' | 'MAINTENANCE' | 'MUSCLE_GAIN'
  days: MealPlanDay[]
  dailyCaloriesTarget?: number
  coachNotes?: string | null
}

export type MealPlanGenerationInput = {
  days: number
  dailyCaloriesTarget?: number
  goal: 'WEIGHT_LOSS' | 'MAINTENANCE' | 'MUSCLE_GAIN'
  dietStyle: 'NONE' | 'VEGETARIAN' | 'VEGAN' | 'KETO' | 'LOW_CARB' | 'MEDITERRANEAN'
  intolerances?: string[]
  locale?: 'en' | 'fr' | 'de'
}

export type MealPlanResponse = {
  plan: MealPlan
}
