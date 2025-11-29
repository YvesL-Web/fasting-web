'use client'

import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { ApiError } from '@/lib/errors'
import type { FastCoachInput, FastCoachResponse } from '@/types/coach'

export function useFastCoachFeedback() {
  return useMutation<FastCoachResponse, ApiError, FastCoachInput>({
    mutationFn: (input) =>
      apiFetch<FastCoachResponse>('/coach/fast-feedback', {
        method: 'POST',
        body: {
          fastId: input.fastId,
          includeFoodSummary: input.includeFoodSummary ?? true,
          locale: input.locale ?? 'fr'
        }
      })
  })
}
