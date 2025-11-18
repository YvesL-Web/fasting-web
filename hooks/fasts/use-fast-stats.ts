'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/components/auth-provider'

import { isApiError, getUserFriendlyMessage } from '@/lib/errors'
import { Stats } from '@/types/fasts'
import { getFastStats } from '../../lib/fasts-client'

export function useFastStats() {
  const { accessToken, clearAuth } = useAuth()
  const router = useRouter()

  const handleUnauthorized = useCallback(
    (error: unknown) => {
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

  const query = useQuery<{ stats: Stats }, Error>({
    queryKey: ['fasts-stats'],
    queryFn: () => getFastStats(accessToken),
    enabled: !!accessToken
  })

  useEffect(() => {
    if (query.isError && query.error) {
      if (handleUnauthorized(query.error)) return
      toast.error('Erreur lors du chargement des stats', {
        description: getUserFriendlyMessage(query.error)
      })
    }
  }, [query.isError, query.error, handleUnauthorized])

  const stats = query.data?.stats

  return {
    ...query,
    stats
  }
}
