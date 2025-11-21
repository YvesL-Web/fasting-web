'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/components/auth-provider'
import { Loader2 } from 'lucide-react'

type Props = {
  children: ReactNode
}

export function ProtectedLayout({ children }: Props) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // fallback rapide si pas de user
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
