'use client'

import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { ApiError } from '@/lib/errors'
import type { FastCoachFeedbackInput, FastCoachFeedbackResponse } from '@/types/coach'

export function useFastCoachFeedback() {
  return useMutation<FastCoachFeedbackResponse, ApiError, FastCoachFeedbackInput>({
    mutationFn: (input) =>
      apiFetch<FastCoachFeedbackResponse>('/coach/fast-feedback', {
        method: 'POST',
        body: input
      })
  })
}
