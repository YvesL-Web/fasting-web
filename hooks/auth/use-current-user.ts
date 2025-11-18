'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/components/auth-provider'

import { isApiError, getUserFriendlyMessage } from '@/lib/errors'
import type { User } from '@/types/auth'
import { useAuthedApi } from './use-authed-api'

export function useCurrentUser() {
  const { user, clearAuth } = useAuth()
  const { authedFetch } = useAuthedApi()
  const router = useRouter()

  const query = useQuery<{ user: User }, Error>({
    queryKey: ['me'],
    queryFn: () => authedFetch<{ user: User }>('/auth/me')
    // si on n'a pas user, on veut quand même essayer (cas reload)
    // donc pas de enabled: !!user, mais on pourrait l'ajouter si tu préfères
  })

  useEffect(() => {
    if (query.isError && query.error) {
      const err = query.error

      if (isApiError(err) && err.code === 'UNAUTHORIZED') {
        // à ce stade, authedFetch a déjà tenté un refresh
        clearAuth()
        toast.error('Session expirée', {
          description: 'Merci de te reconnecter.'
        })
        router.replace('/login')
        return
      }

      toast.error('Erreur lors de la récupération du profil', {
        description: getUserFriendlyMessage(err)
      })
    }
  }, [query.isError, query.error, clearAuth, router])

  // si on a déjà un user dans le contexte et pas encore de data, on peut exposer ça
  const data = query.data ?? (user ? { user } : undefined)

  return {
    ...query,
    data
  }
}
