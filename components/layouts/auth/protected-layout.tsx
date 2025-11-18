'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/components/auth-provider'

import { Loader2 } from 'lucide-react'
import { useCurrentUser } from '@/hooks/auth/use-current-user'

type Props = {
  children: ReactNode
}

export function ProtectedLayout({ children }: Props) {
  const { accessToken } = useAuth()
  const router = useRouter()
  const { data, isLoading } = useCurrentUser()

  // fallback rapide si pas de token
  useEffect(() => {
    if (!accessToken) {
      router.replace('/login')
    }
  }, [accessToken, router])

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Redirection vers la page de connexion...</p>
      </div>
    )
  }

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex items-center gap-2 text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Chargement de ton espace...</span>
        </div>
      </div>
    )
  }

  // user OK → on rend l'app
  return <>{children}</>
}
