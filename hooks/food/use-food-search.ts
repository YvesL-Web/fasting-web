'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { ApiError } from '@/lib/errors'
import type { FoodSearchResponse } from '@/types/food'
import { useDebouncedValue } from '../use-debounced-value'

export function useFoodSearch(term: string) {
  const trimmed = term.trim()

  const debounced = useDebouncedValue(trimmed, 300)

  const enabled = trimmed.length >= 2

  const params = new URLSearchParams()
  if (enabled) params.set('q', debounced)
  const url = `/foods/search?${params.toString()}`

  return useQuery<FoodSearchResponse, ApiError>({
    queryKey: ['food-search', trimmed],
    queryFn: () => apiFetch<FoodSearchResponse>(url),
    enabled,
    staleTime: 30_000, // 30s: évite de refetch si l'utilisateur retape la même chose
    placeholderData: keepPreviousData
  })
}
