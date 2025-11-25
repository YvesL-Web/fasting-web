import { useQuery } from '@tanstack/react-query'

import { Fast, PresetsResponse } from '@/types/fasts'
import { apiFetch } from '@/lib/api'
import { Stats } from '@/types/fasts'
import { ApiError } from '@/lib/errors'

export function useFasts() {
  return useQuery<{ fasts: Fast[] }, ApiError>({
    queryKey: ['fasts'],
    queryFn: () => apiFetch<{ fasts: Fast[] }>('/fasts')
  })
}

export function useFastStats() {
  return useQuery<{ stats: Stats }, ApiError>({
    queryKey: ['fasts-stats'],
    queryFn: () => apiFetch<{ stats: Stats }>('/fasts/stats')
  })
}

export function useFastingPresets() {
  return useQuery<PresetsResponse, ApiError>({
    queryKey: ['fast-presets'],
    queryFn: () => apiFetch<PresetsResponse>('/fasts/presets')
  })
}
