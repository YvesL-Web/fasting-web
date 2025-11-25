'use client'

import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'
import { ApiError } from '@/lib/errors'

type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
}

export function useChangePassword() {
  const { logout } = useAuth()

  return useMutation<void, ApiError, ChangePasswordInput>({
    mutationFn: (data) =>
      apiFetch<void>('/auth/change-password', {
        method: 'POST',
        body: data
      }),
    onSuccess: async () => {
      // côté back toutes les sessions sont déjà révoquées
      await logout()
    }
  })
}

export function useLogoutAllSessions() {
  const { logout } = useAuth()

  return useMutation<void, ApiError, void>({
    mutationFn: () =>
      apiFetch<void>('/auth/logout-all', {
        method: 'POST'
      }),
    onSuccess: async () => {
      await logout()
    }
  })
}
