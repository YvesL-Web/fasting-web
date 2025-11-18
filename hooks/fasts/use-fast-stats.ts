'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { isApiError, getUserFriendlyMessage } from '@/lib/errors'
import { useAuthedApi } from '../auth/use-authed-api'
import { Stats } from '@/types/fasts'

export function useFastStats() {
  const { authedFetch } = useAuthedApi()

  const query = useQuery<{ stats: Stats }, Error>({
    queryKey: ['fasts-stats'],
    queryFn: () => authedFetch<{ stats: Stats }>('/fasts/stats')
  })

  useEffect(() => {
    if (query.isError && query.error) {
      const err = query.error

      // UNAUTHORIZED est déjà géré dans useAuthedApi (refresh + logout),
      // donc on ne toast pas ici dans ce cas-là.
      if (!isApiError(err) || err.code !== 'UNAUTHORIZED') {
        toast.error('Erreur lors du chargement des stats', {
          description: getUserFriendlyMessage(err)
        })
      }
    }
  }, [query.isError, query.error])

  const stats = query.data?.stats

  return {
    ...query,
    stats
  }
}
