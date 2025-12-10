import { z } from 'zod'

export const mealPlanFormSchema = z.object({
  days: z.coerce.number().int().min(1).max(7),
  dailyCaloriesTarget: z
    .union([z.literal(''), z.coerce.number().int().min(1000).max(5000)])
    .optional()
    .transform((v) => (typeof v === 'number' ? v : undefined)),
  goal: z.enum(['WEIGHT_LOSS', 'MAINTENANCE', 'MUSCLE_GAIN']),
  dietStyle: z.enum(['NONE', 'VEGETARIAN', 'VEGAN', 'KETO', 'LOW_CARB', 'MEDITERRANEAN']),
  intolerances: z.string().optional()
})
export type MealPlanFormValues = z.infer<typeof mealPlanFormSchema>
