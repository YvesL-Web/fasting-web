import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100)
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
  displayName: z.string().min(1).max(100),
  locale: z.enum(['en', 'fr', 'de']).default('en').nonoptional()
})

export type RegisterFormValues = z.infer<typeof registerSchema>
