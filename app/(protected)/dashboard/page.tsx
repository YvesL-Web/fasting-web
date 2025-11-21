'use client'

import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { useAuth } from '@/components/auth-provider'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFasts } from '@/hooks/fasts/use-fasts'
import { useFastStats } from '@/hooks/fasts/use-fast-stats'
import { useStartFast, useStopFast } from '@/hooks/fasts/use-fast-mutations'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  // const { fasts, isLoading: isLoadingFasts, isError: isErrorFasts } = useFasts()
  // const { stats, isLoading: isLoadingStats, isError: isErrorStats } = useFastStats()
  // const { startFast, isStarting } = useStartFast()
  // const { stopFast, isStopping } = useStopFast()

  // const isMutating = isStarting || isStopping

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

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

      {/* <main className="p-6 space-y-6">
        <section className="flex gap-4 flex-wrap">
          <Card className="flex-1 min-w-[250px]">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={startFast} disabled={isMutating}>
                {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isStarting ? 'Starting...' : 'Start 16:8'}
              </Button>
              <Button variant="outline" onClick={stopFast} disabled={isMutating}>
                {isStopping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isStopping ? 'Stopping...' : 'Stop'}
              </Button>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[250px]">
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <p className="text-sm text-slate-500">Chargement des stats...</p>
              ) : isErrorStats ? (
                <p className="text-sm text-red-500">Impossible de charger les stats.</p>
              ) : stats ? (
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
              {isLoadingFasts ? (
                <p className="text-sm text-slate-500">Chargement des derniers jeûnes...</p>
              ) : isErrorFasts ? (
                <p className="text-sm text-red-500">Impossible de charger les jeûnes.</p>
              ) : fasts.length === 0 ? (
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
                          Start{' '}
                          {new Date(f.startAt).toLocaleString('fr-FR', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                          {f.endAt && (
                            <>
                              {' '}
                              – End{' '}
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
      </main> */}
    </div>
  )
}
