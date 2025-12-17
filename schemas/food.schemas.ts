import { z } from 'zod'

export const foodEntryFormSchema = z.object({
  label: z.string().min(1, 'Décris ce que tu as mangé'),
  calories: z
    .union([z.coerce.number().int().positive().max(5000), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : (v as number))),
  isPostFast: z.boolean().optional().default(false)
  // recipeId: z.uuid().nullable().optional(),
  // foodItemId: z.uuid().nullable().optional()
})

export type FoodEntryFormValues = z.infer<typeof foodEntryFormSchema>

export const foodItemFormSchema = z.object({
  label: z.string().min(2, 'Nom trop court').max(255, 'Nom trop long'),
  brand: z.string().max(255, 'Marque trop longue').optional().or(z.literal('')),
  servingSize: z.string().max(50, 'Taille de portion trop longue').optional().or(z.literal('')),
  calories: z
    .union([z.string().transform((v) => (v === '' ? undefined : Number(v))), z.number().optional()])
    .refine(
      (v) => v === undefined || (!Number.isNaN(v) && v > 0 && v <= 5000),
      'Entre 1 et 5000 kcal'
    )
    .optional(),
  proteinGrams: z
    .union([z.string().transform((v) => (v === '' ? undefined : Number(v))), z.number().optional()])
    .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0 && v <= 500), 'Entre 0 et 500 g')
    .optional(),
  carbsGrams: z
    .union([z.string().transform((v) => (v === '' ? undefined : Number(v))), z.number().optional()])
    .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0 && v <= 500), 'Entre 0 et 500 g')
    .optional(),
  fatGrams: z
    .union([z.string().transform((v) => (v === '' ? undefined : Number(v))), z.number().optional()])
    .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0 && v <= 500), 'Entre 0 et 500 g')
    .optional()
})
