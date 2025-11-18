'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/components/auth-provider'

import { isApiError, getUserFriendlyMessage } from '@/lib/errors'
import { Fast } from '@/types/fasts'
import { startFastRequest, stopFastRequest } from '../../lib/fasts-client'

function useHandleUnauthorized() {
  const { clearAuth } = useAuth()
  const router = useRouter()

  return useCallback(
    (error: unknown): boolean => {
      if (isApiError(error) && (error.code === 'UNAUTHORIZED' || error.status === 401)) {
        clearAuth()
        toast.error('Session expirée', {
          description: 'Merci de te reconnecter.'
        })
        router.push('/login')
        return true
      }
      return false
    },
    [clearAuth, router]
  )
}

export function useStartFast() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  const handleUnauthorized = useHandleUnauthorized()

  const mutation = useMutation<{ fast: Fast }, unknown, void>({
    mutationFn: () => startFastRequest(accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fasts'] })
      queryClient.invalidateQueries({ queryKey: ['fasts-stats'] })

      toast.success('Jeûne démarré', {
        description: 'Ton jeûne 16:8 est en cours.'
      })
    },
    onError: (error) => {
      if (handleUnauthorized(error)) return
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
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  const handleUnauthorized = useHandleUnauthorized()

  const mutation = useMutation<{ fast: Fast }, unknown, void>({
    mutationFn: () => stopFastRequest(accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fasts'] })
      queryClient.invalidateQueries({ queryKey: ['fasts-stats'] })

      toast.success('Jeûne terminé', {
        description: "Bravo d'avoir complété ce jeûne 🙌"
      })
    },
    onError: (error) => {
      if (handleUnauthorized(error)) return
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
