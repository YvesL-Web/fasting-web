'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { ApiError } from '@/lib/errors'
import type { RecipeListResponse, RecipeDetailResponse } from '@/types/recipes'

type ListParams = {
  scope?: 'me' | 'public'
  tag?: string
  search?: string
}

export function useRecipeList(params: ListParams = { scope: 'me' }) {
  const search = new URLSearchParams()
  search.set('scope', params.scope ?? 'me')
  if (params.tag) search.set('tag', params.tag)
  if (params.search) search.set('search', params.search)
  const qs = search.toString()
  const url = `/recipes${qs ? `?${qs}` : ''}`

  return useQuery<RecipeListResponse, ApiError>({
    queryKey: ['recipes', params.scope ?? 'me', params.tag ?? '', params.search ?? ''],
    queryFn: () => apiFetch<RecipeListResponse>(url)
  })
}

export function useRecipeDetail(id: string | null, enabled = true) {
  return useQuery<RecipeDetailResponse, ApiError>({
    queryKey: ['recipe', id],
    enabled: !!id && enabled,
    queryFn: () => apiFetch<RecipeDetailResponse>(`/recipes/${id}`)
  })
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, { id: string; scope?: 'me' | 'public' }>({
    mutationFn: async ({ id }) => {
      await apiFetch<void>(`/recipes/${id}`, {
        method: 'DELETE'
      })
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['recipes', variables.scope ?? 'me']
      })
    }
  })
}
