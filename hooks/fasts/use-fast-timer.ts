'use client'

import { useEffect, useState } from 'react'

type FastLike = {
  startAt: string
  endAt: string | null
  targetDurationHours: number | null
  fastTargetEndAt: string | null
  eatingWindowStartAt: string | null
  eatingWindowEndAt: string | null
}

export type FastPhase = 'FASTING_WINDOW' | 'EATING_WINDOW' | 'OUTSIDE_WINDOWS'

export type FastTimerState = {
  now: Date
  elapsedMs: number
  elapsedHours: number
  remainingMs: number | null
  remainingHours: number | null
  progress: number | null
  isOverTarget: boolean
  phase: FastPhase
  isInFastingWindow: boolean
  isInEatingWindow: boolean
  phaseLabel: string
}

export function useFastTimer(fast: FastLike | null): FastTimerState {
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    if (!fast) return

    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [fast, fast?.startAt, fast?.endAt, fast?.fastTargetEndAt, fast?.eatingWindowEndAt])

  if (!fast) {
    return {
      now,
      elapsedMs: 0,
      elapsedHours: 0,
      remainingMs: null,
      remainingHours: null,
      progress: null,
      isOverTarget: false,
      phase: 'OUTSIDE_WINDOWS',
      isInFastingWindow: false,
      isInEatingWindow: false,
      phaseLabel: 'Pas de jeûne actif'
    }
  }

  const start = new Date(fast.startAt)
  const end = fast.endAt ? new Date(fast.endAt) : now

  const elapsedMs = Math.max(0, end.getTime() - start.getTime())
  const elapsedHours = elapsedMs / (1000 * 60 * 60)

  // Durée cible de jeûne
  const targetHours = fast.targetDurationHours ?? null
  let remainingMs: number | null = null
  let remainingHours: number | null = null
  let progress: number | null = null
  let isOverTarget = false

  if (targetHours && targetHours > 0) {
    const targetMs = targetHours * 60 * 60 * 1000
    remainingMs = Math.max(0, targetMs - elapsedMs)
    remainingHours = remainingMs / (1000 * 60 * 60)
    progress = Math.min(1, elapsedMs / targetMs)
    isOverTarget = elapsedMs >= targetMs
  }

  // Fenêtres fasting/eating basées sur les dates renvoyées par l’API
  let phase: FastPhase = 'OUTSIDE_WINDOWS'
  let isInFastingWindow = false
  let isInEatingWindow = false

  const fastTargetEndAt = fast.fastTargetEndAt ? new Date(fast.fastTargetEndAt) : null
  const eatingStart = fast.eatingWindowStartAt ? new Date(fast.eatingWindowStartAt) : null
  const eatingEnd = fast.eatingWindowEndAt ? new Date(fast.eatingWindowEndAt) : null

  const nowMs = now.getTime()

  if (fastTargetEndAt && nowMs < fastTargetEndAt.getTime()) {
    phase = 'FASTING_WINDOW'
    isInFastingWindow = true
  } else if (
    eatingStart &&
    eatingEnd &&
    nowMs >= eatingStart.getTime() &&
    nowMs < eatingEnd.getTime()
  ) {
    phase = 'EATING_WINDOW'
    isInEatingWindow = true
  } else {
    phase = 'OUTSIDE_WINDOWS'
  }

  let phaseLabel: string
  if (phase === 'FASTING_WINDOW') {
    phaseLabel = 'Fenêtre de jeûne'
  } else if (phase === 'EATING_WINDOW') {
    phaseLabel = 'Fenêtre d’alimentation'
  } else {
    phaseLabel = 'Hors fenêtres planifiées'
  }

  return {
    now,
    elapsedMs,
    elapsedHours,
    remainingMs,
    remainingHours,
    progress,
    isOverTarget,
    phase,
    isInFastingWindow,
    isInEatingWindow,
    phaseLabel
  }
}
