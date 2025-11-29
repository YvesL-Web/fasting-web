'use client'

import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { ApiError } from '@/lib/errors'
import type { FoodSearchResponse } from '@/types/food'

export function useFoodSearch(term: string) {
  const trimmed = term.trim()

  const enabled = trimmed.length >= 2

  const params = new URLSearchParams()
  if (enabled) params.set('q', trimmed)
  const url = `/foods/search?${params.toString()}`

  return useQuery<FoodSearchResponse, ApiError>({
    queryKey: ['food-search', trimmed],
    queryFn: () => apiFetch<FoodSearchResponse>(url),
    enabled
  })
}
