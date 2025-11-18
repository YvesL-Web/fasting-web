import { apiFetch } from './api'
import type { LoginFormValues, RegisterFormValues } from '@/schemas/auth.schemas'
import type { LoginResponse, RefreshResponse, User } from '@/types/auth'

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

export function refreshTokens(refreshToken: string) {
  return apiFetch<RefreshResponse>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken }
  })
}

export function getCurrentUser(accessToken: string | null) {
  return apiFetch<{ user: User }>('/auth/me', {
    accessToken
  })
}
