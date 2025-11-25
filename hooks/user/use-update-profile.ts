'use client'

import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'
import type { User } from '@/types/auth'
import { ApiError } from '@/lib/errors'

type UpdateProfileInput = {
  displayName: string
  locale: 'en' | 'fr' | 'de'
}

type UpdateProfileResponse = {
  user: User
}

export function useUpdateProfile() {
  const { setUser } = useAuth()

  return useMutation<UpdateProfileResponse, ApiError, UpdateProfileInput>({
    mutationFn: (data) =>
      apiFetch<UpdateProfileResponse>('/users/me', {
        method: 'PATCH',
        body: data
      }),
    onSuccess: (data) => {
      setUser(data.user)
    }
  })
}
