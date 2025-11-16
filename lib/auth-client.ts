import { LoginResponse } from '@/types/auth'
import { apiFetch } from './api'
import type { LoginFormValues, RegisterFormValues } from '@/schemas/auth.schemas'

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
