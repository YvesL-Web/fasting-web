'use client'

import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { ApiError } from '@/lib/errors'
import { MealPlanGenerationInput, MealPlanResponse } from '../../types/meal-plan'

export function useGenerateMealPlan() {
  return useMutation<MealPlanResponse, ApiError, MealPlanGenerationInput>({
    mutationFn: (input) =>
      apiFetch<MealPlanResponse>('/meal-plans/generate', {
        method: 'POST',
        body: input
      })
  })
}
