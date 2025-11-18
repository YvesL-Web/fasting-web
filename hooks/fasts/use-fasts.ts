'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuthedApi } from '../auth/use-authed-api'
import { isApiError, getUserFriendlyMessage } from '@/lib/errors'
import { Fast } from '@/types/fasts'

export function useFasts() {
  const { authedFetch } = useAuthedApi()

  const query = useQuery<{ fasts: Fast[] }, Error>({
    queryKey: ['fasts'],
    queryFn: () => authedFetch<{ fasts: Fast[] }>('/fasts')
  })

  useEffect(() => {
    if (query.isError && query.error) {
      const err = query.error
      // si c'est un UNAUTHORIZED, useAuthedApi s'en est déjà chargé (refresh ou logout)
      if (!isApiError(err) || err.code !== 'UNAUTHORIZED') {
        toast.error('Erreur lors du chargement des jeûnes', {
          description: getUserFriendlyMessage(err)
        })
      }
    }
  }, [query.isError, query.error])

  const fasts = query.data?.fasts ?? []

  return {
    ...query,
    fasts
  }
}
