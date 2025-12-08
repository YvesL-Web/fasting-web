'use client'

import { ReactNode } from 'react'

import { PremiumBadge } from './premium-badge'
import { Button } from './ui/button'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/hooks/auth/use-subscription'

type Props = {
  children: ReactNode
  className?: string
  compact?: boolean
}

export function PremiumGuard({ children, className, compact }: Props) {
  const { isPremium, plan } = useSubscription()
  const router = useRouter()

  if (isPremium) {
    return <>{children}</>
  }

  return (
    <div className={cn('relative', className)}>
      <div className={cn(!compact && 'opacity-40 pointer-events-none')}>{children}</div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-auto rounded-md border border-amber-500/40 bg-slate-950/90 px-3 py-2 text-center shadow-lg shadow-amber-500/10">
          <div className="mb-1 flex items-center justify-center gap-1">
            <Lock className="h-3 w-3 text-amber-300" />
            <PremiumBadge className="border-none bg-transparent px-0" label="Premium only" />
          </div>
          <p className="text-[11px] text-slate-200">
            Cette fonctionnalité est réservée aux utilisateurs Premium.
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Ton plan actuel : <span className="font-semibold">{plan}</span>
          </p>
          <Button
            size="icon"
            className="mt-2 h-7 text-[11px]"
            onClick={() => router.push('/pricing')}
          >
            Voir les offres
          </Button>
        </div>
      </div>
    </div>
  )
}
