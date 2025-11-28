import { apiFetch } from '@/lib/api'
import { ApiError } from '@/lib/errors'
import { CreateFoodEntryInput, FoodEntriesResponse, FoodEntry } from '@/types/food'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useFoodEntries(day: string) {
  return useQuery<FoodEntriesResponse, ApiError>({
    queryKey: ['food-entries', day],
    queryFn: () => apiFetch<FoodEntriesResponse>(`/food-entries?day=${encodeURIComponent(day)}`)
  })
}

export function useCreateFoodEntry(day: string) {
  const queryClient = useQueryClient()

  return useMutation<{ entry: FoodEntry }, ApiError, CreateFoodEntryInput>({
    mutationFn: (input) =>
      apiFetch<{ entry: FoodEntry }>('/food-entries', {
        method: 'POST',
        body: input
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['food-entries', day] })
    }
  })
}
