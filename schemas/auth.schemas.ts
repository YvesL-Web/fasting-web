import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100)
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
  displayName: z.string().min(1).max(100),
  locale: z.enum(['en', 'fr', 'de']).default('en').nonoptional()
})
export type RegisterInput = z.infer<typeof registerSchema>

export const requestPasswordResetFormSchema = z.object({
  email: z.email()
})
export type RequestPasswordResetFormValues = z.infer<typeof requestPasswordResetFormSchema>
export const resetPasswordFormSchema = z
  .object({
    email: z.email(),
    code: z.string().length(6).regex(/^\d+$/),
    newPassword: z.string().min(8).max(100),
    confirmNewPassword: z.string().min(8).max(100)
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmNewPassword']
  })
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>
export type ResetPasswordInput = {
  email: string
  code: string
  newPassword: string
}
export const ResetPasswordSchema = z.object({
  email: z.email(),
  code: z.string().length(6).regex(/^\d+$/),
  newPassword: z.string().min(8).max(100)
})

export const verifyEmailSchema = z.object({
  email: z.email(),
  code: z.string().length(6).regex(/^\d+$/)
})

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
