import { z } from 'zod'

export const foodEntryFormSchema = z.object({
  label: z.string().min(1, 'Décris ce que tu as mangé'),
  calories: z
    .union([z.coerce.number().int().positive().max(5000), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : (v as number)))
})

export type FoodEntryFormValues = z.infer<typeof foodEntryFormSchema>
