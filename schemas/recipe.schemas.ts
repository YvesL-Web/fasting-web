import { z } from 'zod'

export const recipeFormSchema = z.object({
  title: z.string().min(2, 'Titre trop court').max(255),
  description: z.string().max(5000).optional(),
  isPublic: z.boolean().default(false),
  prepTimeMinutes: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== '' ? Number(v) : undefined))
    .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0), {
      message: 'Durée invalide'
    }),
  cookTimeMinutes: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== '' ? Number(v) : undefined))
    .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0), {
      message: 'Durée invalide'
    }),
  servings: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== '' ? Number(v) : undefined))
    .refine((v) => v === undefined || (!Number.isNaN(v) && v > 0), {
      message: 'Portions invalides'
    }),
  totalCalories: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== '' ? Number(v) : undefined))
    .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0), {
      message: 'Calories invalides'
    }),
  tags: z.string().optional(), // "petit-dej,snack"
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1, 'Nom requis'),
        quantity: z.string().optional()
      })
    )
    .optional(),
  steps: z
    .array(
      z.object({
        text: z.string().min(1, 'Étape requise')
      })
    )
    .optional(),
  imageFile: z.any().optional(), // géré côté TS plutôt que validation stricte
  proteinGrams: z.coerce.number().nonnegative().max(500).optional(),
  carbsGrams: z.coerce.number().nonnegative().max(500).optional(),
  fatGrams: z.coerce.number().nonnegative().max(500).optional()
})

export type RecipeFormSchema = z.infer<typeof recipeFormSchema>
