'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Fast, StartFastInput } from '@/types/fasts'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { ApiError } from '@/lib/errors'

export function useStartFast() {
  const queryClient = useQueryClient()
  return useMutation<{ fast: Fast }, ApiError, StartFastInput>({
    mutationFn: async (input) =>
      apiFetch<{ fast: Fast }>('/fasts/start', {
        method: 'POST',
        body: input
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['current-stats'] })
      void queryClient.invalidateQueries({ queryKey: ['fasts'] })
      void queryClient.invalidateQueries({ queryKey: ['fasts-stats'] })
    }
  })
}

export function useStopFast() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () =>
      apiFetch<{ fast: Fast }>('/fasts/stop', {
        method: 'POST',
        body: {}
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fasts'] })
      queryClient.invalidateQueries({ queryKey: ['fasts-stats'] })
      toast.success('Jeûne terminé', {
        description: 'Bravo d’avoir complété ce jeûne 🙌'
      })
    },
    onError: (err) => {
      toast.error('Erreur', {
        description: err.message ?? 'Impossible de stopper le jeûne.'
      })
    }
  })
}
