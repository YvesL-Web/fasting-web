'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'
import type { SessionInfo } from '@/types/auth'
import { ApiError } from '@/lib/errors'

type SessionsResponse = {
  sessions: SessionInfo[]
}

export function useSessions() {
  return useQuery<SessionsResponse, ApiError>({
    queryKey: ['sessions'],
    queryFn: () => apiFetch<SessionsResponse>('/auth/sessions')
  })
}

type RevokeVars = {
  id: string
  isCurrent: boolean
}

export function useRevokeSession() {
  const queryClient = useQueryClient()
  const { logout } = useAuth()

  return useMutation<void, ApiError, RevokeVars>({
    mutationFn: ({ id }) =>
      apiFetch<void>(`/auth/sessions/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: async (_data, vars) => {
      await queryClient.invalidateQueries({ queryKey: ['sessions'] })
      // Si on supprime la session courante → on déconnecte aussi côté front
      if (vars.isCurrent) {
        await logout()
      }
    }
  })
}
