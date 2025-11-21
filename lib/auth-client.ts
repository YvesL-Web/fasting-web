import { apiFetch } from './api'
import type { LoginFormValues, RegisterFormValues } from '@/schemas/auth.schemas'
import type { LoginResponse, User } from '@/types/auth'

export function login(input: LoginFormValues) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: input
  })
}

export function register(input: RegisterFormValues) {
  return apiFetch<LoginResponse>('/auth/register', {
    method: 'POST',
    body: input
  })
}

export function getCurrentUser(accessToken: string | null) {
  return apiFetch<{ user: User }>('/auth/me', {
    accessToken
  })
}

// Mot de passe oublié
export function requestPasswordReset(input: { email: string }) {
  return apiFetch<{ ok: true }>('/auth/request-password-reset', {
    method: 'POST',
    body: input
  })
}

// Reset password avec token
export function resetPassword(input: { token: string; newPassword: string }) {
  return apiFetch<void>('/auth/reset-password', {
    method: 'POST',
    body: input
  })
}

// Vérifier email avec token
export function verifyEmail(input: { token: string }) {
  return apiFetch<void>('/auth/verify-email', {
    method: 'POST',
    body: input
  })
}
