'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Fast } from '@/types/fasts'
import { apiFetch } from '@/lib/api'

export function useStartFast() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () =>
      apiFetch<{ fast: Fast }>('/fasts/start', {
        method: 'POST',
        body: { type: '16_8', notes: 'Started from dashboard' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fasts'] })
      queryClient.invalidateQueries({ queryKey: ['fasts-stats'] })
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
    }
  })
}
