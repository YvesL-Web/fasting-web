export type RecipeAuthor = {
  id: string
  displayName: string
}

export type RecipeSummary = {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  isPublic: boolean
  prepTimeMinutes: number | null
  cookTimeMinutes: number | null
  servings: number | null
  totalCalories: number | null
  proteinGrams: number | null
  carbsGrams: number | null
  fatGrams: number | null
  tags: string[]
  createdAt: string
  updatedAt: string
  author: RecipeAuthor
}

export type RecipeDetail = RecipeSummary & {
  ingredients: { name: string; quantity: string | null }[]
  steps: { order: number; text: string }[]
}

export type RecipeListResponse = {
  recipes: RecipeSummary[]
}

export type RecipeDetailResponse = {
  recipe: RecipeDetail
}
