import { Fast, Stats } from '@/types/fasts'
import { apiFetch } from './api'

export function getFasts(accessToken: string | null) {
  return apiFetch<{ fasts: Fast[] }>('/fasts', { accessToken })
}

export function getFastStats(accessToken: string | null) {
  return apiFetch<{ stats: Stats }>('/fasts/stats', { accessToken })
}

export function startFastRequest() {
  return apiFetch<{ fast: Fast }>('/fasts/start', {
    method: 'POST',
    body: { type: '16_8', notes: 'Started from dashboard' }
  })
}

export function stopFastRequest(accessToken: string | null) {
  return apiFetch<{ fast: Fast }>('/fasts/stop', {
    method: 'POST',
    body: {},
    accessToken
  })
}
