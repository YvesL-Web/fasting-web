'use client'

import { useAuth } from '@/components/auth-provider'
import type { SubscriptionPlan } from '@/types/auth'

// FREE < PREMIUM_MONTHLY < PREMIUM_YEARLY
const PLAN_ORDER: SubscriptionPlan[] = ['FREE', 'PREMIUM_MONTHLY', 'PREMIUM_YEARLY']

export function useSubscription() {
  const { user } = useAuth()
  const plan: SubscriptionPlan = user?.subscriptionPlan ?? 'FREE'

  const isFree = plan === 'FREE'
  const isPremium = plan === 'PREMIUM_MONTHLY' || plan === 'PREMIUM_YEARLY'

  const hasAtLeast = (minPlan: SubscriptionPlan) => {
    const currentIdx = PLAN_ORDER.indexOf(plan)
    const minIdx = PLAN_ORDER.indexOf(minPlan)
    return currentIdx >= 0 && minIdx >= 0 && currentIdx >= minIdx
  }

  return {
    plan,
    isFree,
    isPremium,
    hasAtLeast
  }
}
