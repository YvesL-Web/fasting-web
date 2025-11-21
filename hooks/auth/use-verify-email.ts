'use client'

import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { ApiError } from '@/lib/errors'
import { VerifyEmailInput } from '@/types/auth'

export function useVerifyEmail() {
  return useMutation<void, ApiError, VerifyEmailInput>({
    mutationFn: (data) =>
      apiFetch<void>('auth/verify-email', {
        method: 'POST',
        body: data
      })
  })
}
