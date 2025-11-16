'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Fast = {
  id: string
  type: string
  startAt: string
  endAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

type Stats = {
  totalFasts: number
  totalHours: number
  averageHours: number
  longestFastHours: number
  currentStreakDays: number
}

export default function DashboardPage() {
  const { user, accessToken, clearAuth } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  // Redirect si pas connecté
  useEffect(() => {
    if (!accessToken) {
      router.push('/login')
    }
  }, [accessToken, router])

  const { data: fastsData } = useQuery({
    queryKey: ['fasts'],
    queryFn: () =>
      apiFetch<{ fasts: Fast[] }>('/fasts', {
        accessToken
      }),
    enabled: !!accessToken
  })

  const { data: statsData } = useQuery({
    queryKey: ['fasts-stats'],
    queryFn: () =>
      apiFetch<{ stats: Stats }>('/fasts/stats', {
        accessToken
      }),
    enabled: !!accessToken
  })

  const startMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ fast: Fast }>('/fasts/start', {
        method: 'POST',
        body: { type: '16_8', notes: 'Started from dashboard' },
        accessToken
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fasts'] })
      queryClient.invalidateQueries({ queryKey: ['fasts-stats'] })
    }
  })

  const stopMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ fast: Fast }>('/fasts/stop', {
        method: 'POST',
        body: {},
        accessToken
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fasts'] })
      queryClient.invalidateQueries({ queryKey: ['fasts-stats'] })
    }
  })

  const isLoading = startMutation.isPending || stopMutation.isPending

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  const fasts = fastsData?.fasts ?? []
  const stats = statsData?.stats

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div>
          <h1 className="text-xl font-semibold">Fasting Dashboard</h1>
          {user && (
            <p className="text-sm text-slate-600">
              Bonjour, <span className="font-medium">{user.displayName}</span>
            </p>
          )}
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      <main className="p-6 space-y-6">
        <section className="flex gap-4 flex-wrap">
          <Card className="flex-1 min-w-[250px]">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={() => startMutation.mutate()} disabled={isLoading}>
                Start 16:8
              </Button>
              <Button variant="outline" onClick={() => stopMutation.mutate()} disabled={isLoading}>
                Stop
              </Button>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[250px]">
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent>
              {stats ? (
                <ul className="space-y-1 text-sm">
                  <li>Total fasts: {stats.totalFasts}</li>
                  <li>Total hours: {stats.totalHours.toFixed(1)}</li>
                  <li>Average: {stats.averageHours.toFixed(1)} h</li>
                  <li>Longest: {stats.longestFastHours.toFixed(1)} h</li>
                  <li>Streak: {stats.currentStreakDays} day(s)</li>
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No stats yet. Start your first fast 🚀</p>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Recent fasts</CardTitle>
            </CardHeader>
            <CardContent>
              {fasts.length === 0 ? (
                <p className="text-sm text-slate-500">No fasts yet. Start one above.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {fasts.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between border-b pb-1 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium">{f.type}</p>
                        <p className="text-xs text-slate-500">
                          Start:{' '}
                          {new Date(f.startAt).toLocaleString('fr-FR', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                          {f.endAt && (
                            <>
                              {' '}
                              – End:{' '}
                              {new Date(f.endAt).toLocaleString('fr-FR', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {f.endAt ? 'Done' : 'In progress'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
