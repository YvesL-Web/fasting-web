'use client'

import { Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSubscription } from '@/hooks/auth/use-subscription'

type Props = {
  className?: string
  label?: string
}

export function PremiumBadge({ className, label }: Props) {
  const { plan } = useSubscription()

  const defaultLabel =
    plan === 'PREMIUM_YEARLY'
      ? 'Premium annuel'
      : plan === 'PREMIUM_MONTHLY'
      ? 'Premium mensuel'
      : 'Premium'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300',
        className
      )}
    >
      <Crown className="h-3 w-3" />
      {label ?? defaultLabel}
    </span>
  )
}
