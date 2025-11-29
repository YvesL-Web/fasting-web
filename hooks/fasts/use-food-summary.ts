'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { ApiError } from '@/lib/errors'
import type { FoodSummaryResponse } from '@/types/food'

type Params = {
  from?: string // YYYY-MM-DD
  to?: string // YYYY-MM-DD
}

export function useFoodSummary(params: Params = {}) {
  const search = new URLSearchParams()
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  const qs = search.toString()
  const url = `/food-entries/summary${qs ? `?${qs}` : ''}`

  return useQuery<FoodSummaryResponse, ApiError>({
    queryKey: ['food-summary', params.from, params.to],
    queryFn: () => apiFetch<FoodSummaryResponse>(url)
  })
}
