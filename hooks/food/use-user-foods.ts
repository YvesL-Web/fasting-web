'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { ApiError, isApiError } from '@/lib/errors'
import type { CreateFoodItemInput, UserFoodsResponse, FoodItem } from '@/types/food'
import { toast } from 'sonner'

export function useUserFoods() {
  return useQuery<UserFoodsResponse, ApiError>({
    queryKey: ['user-foods'],
    queryFn: () => apiFetch<UserFoodsResponse>('/foods')
  })
}

export function useCreateFoodItem() {
  const queryClient = useQueryClient()

  return useMutation<{ item: FoodItem }, ApiError, CreateFoodItemInput>({
    mutationFn: (input) =>
      apiFetch<{ item: FoodItem }>('/foods', {
        method: 'POST',
        body: input
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['user-foods'] })
      toast.success('Aliment créé', {
        description: 'Ton aliment a été ajouté à ta base personnelle.'
      })
    },
    onError: (err) => {
      if (isApiError(err)) {
        toast.error('Erreur', {
          description: err.message ?? 'Impossible de créer cet aliment.'
        })
      } else {
        toast.error('Erreur', {
          description: 'Impossible de créer cet aliment.'
        })
      }
    }
  })
}

export function useDeleteFoodItem() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, { id: string; label?: string }>({
    mutationFn: ({ id }) =>
      apiFetch<void>(`/foods/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['user-foods'] })
      void queryClient.invalidateQueries({ queryKey: ['food-search'] })
      toast.success('Aliment supprimé', {
        description: variables.label
          ? `"${variables.label}" a été supprimé de ta base`
          : 'Aliment supprimé'
      })
    },
    onError: (err) => {
      if (isApiError(err)) {
        toast.error('Erreur', {
          description: err.message ?? 'Impossible de supprimer cet aliment.'
        })
      } else {
        toast.error('Erreur', {
          description: 'Impossible de supprimer cet aliment.'
        })
      }
    }
  })
}
