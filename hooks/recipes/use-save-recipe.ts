'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/errors'
import type { RecipeDetail, RecipeDetailResponse } from '@/types/recipes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'

export type RecipeFormValues = {
  id?: string
  title: string
  description?: string | null
  isPublic: boolean
  prepTimeMinutes?: number | null
  cookTimeMinutes?: number | null
  servings?: number | null
  totalCalories?: number | null
  tags?: string[]
  ingredients?: { name: string; quantity?: string | null }[]
  steps?: { text: string }[]
  imageFile?: File | null
}

function buildFormData(values: RecipeFormValues): FormData {
  const fd = new FormData()
  fd.set('title', values.title)
  if (values.description) fd.set('description', values.description)
  fd.set('isPublic', values.isPublic ? 'true' : 'false')

  if (values.prepTimeMinutes != null) fd.set('prepTimeMinutes', String(values.prepTimeMinutes))
  if (values.cookTimeMinutes != null) fd.set('cookTimeMinutes', String(values.cookTimeMinutes))
  if (values.servings != null) fd.set('servings', String(values.servings))
  if (values.totalCalories != null) fd.set('totalCalories', String(values.totalCalories))

  if (values.tags && values.tags.length > 0) {
    fd.set('tags', values.tags.join(','))
  }

  if (values.ingredients && values.ingredients.length > 0) {
    const normalized = values.ingredients
      .filter((i) => i.name.trim().length > 0)
      .map((i) => ({
        name: i.name.trim(),
        quantity: i.quantity && i.quantity.trim().length > 0 ? i.quantity.trim() : null
      }))
    fd.set('ingredients', JSON.stringify(normalized))
  }

  if (values.steps && values.steps.length > 0) {
    const normalized = values.steps
      .filter((s) => s.text.trim().length > 0)
      .map((s, idx) => ({
        order: idx + 1,
        text: s.text.trim()
      }))
    fd.set('steps', JSON.stringify(normalized))
  }

  if (values.imageFile) {
    fd.append('image', values.imageFile)
  }

  return fd
}

async function createRecipe(values: RecipeFormValues): Promise<RecipeDetail> {
  const formData = buildFormData(values)

  const res = await fetch(`${API_BASE_URL}/recipes`, {
    method: 'POST',
    body: formData,
    credentials: 'include'
  })

  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    const status = res.status
    const code = json?.error ?? null
    const message = json?.message ?? 'Impossible de créer la recette.'
    const details = json?.details ?? null
    throw new ApiError({ status, code, message, details })
  }

  return (json as RecipeDetailResponse).recipe
}

async function updateRecipe(values: RecipeFormValues): Promise<RecipeDetail> {
  if (!values.id) {
    throw new Error('Missing recipe id for update')
  }

  const formData = buildFormData(values)

  const res = await fetch(`${API_BASE_URL}/recipes/${values.id}`, {
    method: 'PATCH',
    body: formData,
    credentials: 'include'
  })

  const json = await res.json().catch(() => ({}))

  if (!res.ok) {
    const status = res.status
    const code = json?.error ?? null
    const message = json?.message ?? 'Impossible de mettre à jour la recette.'
    const details = json?.details ?? null
    throw new ApiError({ status, code, message, details })
  }

  return (json as RecipeDetailResponse).recipe
}

export function useSaveRecipe(scope: 'me' | 'public' = 'me') {
  const queryClient = useQueryClient()

  return useMutation<RecipeDetail, ApiError, RecipeFormValues>({
    mutationFn: (values) => (values.id ? updateRecipe(values) : createRecipe(values)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recipes', scope] })
    }
  })
}
