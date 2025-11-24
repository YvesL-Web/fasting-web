import { apiFetch } from '@/lib/api'
import {
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  ResetPasswordSchema,
  verifyEmailSchema
} from '@/schemas/auth.schemas'
import { useMutation } from '@tanstack/react-query'
import { LoginResponse } from '@/types/auth'

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
    mutationFn: async (input: ResetPasswordInput) => {
      const parsed = ResetPasswordSchema.parse(input)
      return apiFetch<void>('/auth/reset-password', {
        method: 'POST',
        body: parsed
      })
    }
  })
}

export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: async (input: { email: string }) => {
      const parsed = verifyEmailSchema.pick({ email: true }).parse(input)
      return apiFetch<{ ok: boolean; message?: string }>('/auth/resend-verification-code', {
        method: 'POST',
        body: parsed
      })
    }
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      return apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: input
      })
    }
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      return apiFetch<{ message: string }>('/auth/register', {
        method: 'POST',
        body: input
      })
    }
  })
}
