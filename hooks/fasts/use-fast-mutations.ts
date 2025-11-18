'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { isApiError, getUserFriendlyMessage } from '@/lib/errors'
import { Fast } from '@/types/fasts'
import { useAuthedApi } from '../auth/use-authed-api'

export function useStartFast() {
  const { authedFetch } = useAuthedApi()
  const queryClient = useQueryClient()

  const mutation = useMutation<{ fast: Fast }, unknown, void>({
    mutationFn: () =>
      authedFetch<{ fast: Fast }>('/fasts/start', {
        method: 'POST',
        body: { type: '16_8', notes: 'Started from dashboard' }
      }),
    onSuccess: () => {
      // on invalide les caches liés aux jeûnes
      queryClient.invalidateQueries({ queryKey: ['fasts'] })
      queryClient.invalidateQueries({ queryKey: ['fasts-stats'] })

      toast.success('Jeûne démarré', {
        description: 'Ton jeûne 16:8 est en cours.'
      })
    },
    onError: (error) => {
      // si UNAUTHORIZED, useAuthedApi a déjà géré (refresh ou logout)
      if (isApiError(error) && error.code === 'UNAUTHORIZED') {
        return
      }

      toast.error('Erreur', {
        description: getUserFriendlyMessage(error)
      })
    }
  })

  return {
    startFast: () => mutation.mutate(),
    isStarting: mutation.isPending
  }
}

export function useStopFast() {
  const { authedFetch } = useAuthedApi()
  const queryClient = useQueryClient()

  const mutation = useMutation<{ fast: Fast }, unknown, void>({
    mutationFn: () =>
      authedFetch<{ fast: Fast }>('/fasts/stop', {
        method: 'POST',
        body: {}
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fasts'] })
      queryClient.invalidateQueries({ queryKey: ['fasts-stats'] })

      toast.success('Jeûne terminé', {
        description: "Bravo d'avoir complété ce jeûne 🙌"
      })
    },
    onError: (error) => {
      if (isApiError(error) && error.code === 'UNAUTHORIZED') {
        return
      }

      toast.error('Erreur', {
        description: getUserFriendlyMessage(error)
      })
    }
  })

  return {
    stopFast: () => mutation.mutate(),
    isStopping: mutation.isPending
  }
}
