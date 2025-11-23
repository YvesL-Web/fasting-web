'use client'

import { useMutation } from '@tanstack/react-query'

import { useAuth } from '@/components/auth-provider'
import type { User } from '@/types/auth'
import { ApiError } from '@/lib/errors'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'

type UploadAvatarResponse = {
  avatarUrl: string
}

async function uploadAvatarRequest(file: File): Promise<UploadAvatarResponse> {
  const formData = new FormData()
  formData.append('avatar', file)

  const res = await fetch(`${API_BASE_URL}/users/me/avatar`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    const status = res.status
    const code = payload?.error ?? null
    const message = payload?.message ?? `HTTP error ${status}`
    const details = payload?.details ?? null
    throw new ApiError({ status, code, message, details })
  }

  return (payload ?? {}) as UploadAvatarResponse
}

export function useUploadAvatar() {
  const { user, setUser } = useAuth()

  return useMutation<UploadAvatarResponse, ApiError, File>({
    mutationFn: uploadAvatarRequest,
    onSuccess: (data) => {
      // mettre à jour l’avatar en local
      if (user) {
        const updated: User = { ...user, avatarUrl: data.avatarUrl }
        setUser(updated)
      }
    }
  })
}
