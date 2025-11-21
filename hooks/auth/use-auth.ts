import { apiFetch } from '@/lib/api'
import {
  resetPasswordFormSchema,
  verifyEmailSchema,
  type ResetPasswordFormValues
} from '@/schemas/auth.schemas'
import { useMutation } from '@tanstack/react-query'

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (input: unknown) => {
      const parsed = verifyEmailSchema.parse(input)
      return apiFetch<void>('/auth/verify-email', {
        method: 'POST',
        body: parsed
      })
    }
  })
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (input: { email: string }) => {
      const parsed = verifyEmailSchema.pick({ email: true }).parse(input)
      return apiFetch<{ ok: true }>('/auth/request-password-reset', {
        method: 'POST',
        body: parsed
      })
    }
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (input: ResetPasswordFormValues) => {
      const parsed = resetPasswordFormSchema.parse(input)
      return apiFetch<void>('/auth/reset-password', {
        method: 'POST',
        body: parsed
      })
    }
  })
}
