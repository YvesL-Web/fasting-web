'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { ApiError } from '@/lib/errors'
import type { FoodSearchResponse } from '@/types/food'
import { useDebouncedValue } from '../use-debounced-value'

export function useFoodSearch(term: string, limit = 10) {
  const trimmed = term.trim()
  const debounced = useDebouncedValue(trimmed, 350)

  const enabled = trimmed.length >= 2

  const params = new URLSearchParams()
  if (enabled) {
    params.set('q', debounced)
    params.set('limit', limit.toString())
  }

  const url = enabled ? `/foods/search?${params.toString()}` : '/foods/search?q='

  return useQuery<FoodSearchResponse, ApiError>({
    queryKey: ['food-search', debounced, trimmed],
    queryFn: () => apiFetch<FoodSearchResponse>(url),
    enabled,
    staleTime: 30_000, // 30s: évite de refetch si l'utilisateur retape la même chose
    placeholderData: keepPreviousData
  })
}
