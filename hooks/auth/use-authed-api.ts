'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { apiFetch, type ApiOptions } from '@/lib/api'
import { useAuth } from '@/components/auth-provider'
import { isApiError } from '@/lib/errors'
import { toast } from 'sonner'
import { refreshTokens } from '../../lib/auth-client'

export function useAuthedApi() {
  const { user, accessToken, refreshToken, setAuth, clearAuth } = useAuth()
  const router = useRouter()

  const authedFetch = useCallback(
    async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
      // 1. on utilise l'accessToken passé ou celui du contexte
      const tokenToUse = options.accessToken ?? accessToken ?? undefined

      try {
        return await apiFetch<T>(path, {
          ...options,
          accessToken: tokenToUse
        })
      } catch (err) {
        // 2. si UNAUTHORIZED et qu'on a un refreshToken → on tente un refresh
        if (isApiError(err) && err.code === 'UNAUTHORIZED' && refreshToken) {
          try {
            const result = await refreshTokens(refreshToken)

            // mettre à jour le contexte d'auth (user inchangé)
            if (user) {
              setAuth({
                user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
              })
            }

            // rejouer la requête avec le nouveau accessToken
            return await apiFetch<T>(path, {
              ...options,
              accessToken: result.accessToken
            })
          } catch (refreshError) {
            // échec du refresh → auto-logout
            clearAuth()
            toast.error('Session expirée', {
              description: 'Merci de te reconnecter.'
            })
            router.push('/login')
            throw refreshError
          }
        }

        // 3. autres erreurs → remonter
        throw err
      }
    },
    [accessToken, refreshToken, user, setAuth, clearAuth, router]
  )

  return { authedFetch }
}
