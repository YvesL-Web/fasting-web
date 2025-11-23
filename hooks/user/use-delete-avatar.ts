'use client'

import { useMutation } from '@tanstack/react-query'

import { useAuth } from '@/components/auth-provider'
import type { User } from '@/types/auth'
import { ApiError } from '@/lib/errors'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'

async function deleteAvatarRequest(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/users/me/avatar`, {
    method: 'DELETE',
    credentials: 'include'
  })

  if (!res.ok) {
    const isJson = res.headers.get('content-type')?.includes('application/json')
    const payload = isJson ? await res.json().catch(() => null) : null
    const status = res.status
    const code = payload?.error ?? null
    const message = payload?.message ?? `HTTP error ${status}`
    const details = payload?.details ?? null
    throw new ApiError({ status, code, message, details })
  }
}

export function useDeleteAvatar() {
  const { user, setUser } = useAuth()

  return useMutation<void, ApiError>({
    mutationFn: deleteAvatarRequest,
    onSuccess: () => {
      if (user) {
        const updated: User = { ...user, avatarUrl: null }
        setUser(updated)
      }
    }
  })
}
