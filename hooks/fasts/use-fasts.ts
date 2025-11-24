import { useQuery } from '@tanstack/react-query'

import { Fast } from '@/types/fasts'
import { apiFetch } from '@/lib/api'
import { Stats } from '@/types/fasts'

export function useFasts() {
  return useQuery<{ fasts: Fast[] }>({
    queryKey: ['fasts'],
    queryFn: () => apiFetch<{ fasts: Fast[] }>('/fasts')
  })
}

export function useFastStats() {
  return useQuery<{ stats: Stats }>({
    queryKey: ['fasts-stats'],
    queryFn: () => apiFetch<{ stats: Stats }>('/fasts/stats')
  })
}
