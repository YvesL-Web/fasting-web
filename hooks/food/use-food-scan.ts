'use client'

import { useState, useCallback } from 'react'
import type { FoodScanResponse } from '@/types/food-scanner'
import { ApiError } from '@/lib/errors'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'

export function useFoodScan() {
  const [isScanning, setIsScanning] = useState(false)
  const [lastResult, setLastResult] = useState<FoodScanResponse | null>(null)
  const [error, setError] = useState<ApiError | null>(null)

  const scan = useCallback(async (file: File, opts?: { autoCreateItems?: boolean }) => {
    setIsScanning(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const params = new URLSearchParams()
      if (opts?.autoCreateItems) params.set('autoCreateItems', 'true')

      const res = await fetch(`${API_BASE_URL}/ai/scan-food?${params.toString()}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        const status = res.status
        const code = json?.error ?? null
        const message = json?.message ?? `HTTP error ${status}`
        const details = json?.details ?? null
        const apiErr = new ApiError({ status, code, message, details })
        setError(apiErr)
        throw apiErr
      }

      const data = json as FoodScanResponse
      setLastResult(data)
      return data
    } finally {
      setIsScanning(false)
    }
  }, [])

  return {
    isScanning,
    lastResult,
    error,
    scan
  }
}
