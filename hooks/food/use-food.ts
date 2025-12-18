import { apiFetch } from '@/lib/api'
import { ApiError } from '@/lib/errors'
import {
  CreateFoodEntryInput,
  FoodEntriesResponse,
  FoodEntry,
  UpdateFoodEntryInput
} from '@/types/food'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

function normalizeCreateInput(input: CreateFoodEntryInput) {
  const loggedAt =
    input.loggedAt instanceof Date ? input.loggedAt.toISOString() : input.loggedAt ?? undefined
  return { ...input, loggedAt }
}

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
        body: normalizeCreateInput(input)
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['food-entries', day] })
      await queryClient.invalidateQueries({ queryKey: ['food-summary'] })
    }
  })
}

export function useUpdateFoodEntry(day: string) {
  const queryClient = useQueryClient()

  return useMutation<{ entry: FoodEntry }, ApiError, { id: string; input: UpdateFoodEntryInput }>({
    mutationFn: ({ id, input }) =>
      apiFetch<{ entry: FoodEntry }>(`/food-entries/${id}`, {
        method: 'PATCH',
        body: input
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['food-entries', day] })
      void queryClient.invalidateQueries({ queryKey: ['food-summary'] })
    }
  })
}

export function useDeleteFoodEntry(day: string) {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, { id: string }>({
    mutationFn: async ({ id }) => {
      await apiFetch<void>(`/food-entries/${id}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['food-entries', day] })
      void queryClient.invalidateQueries({ queryKey: ['food-summary'] })
    }
  })
}
