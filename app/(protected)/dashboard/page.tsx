'use client'

import { Loader2 } from 'lucide-react'

import { useAuth } from '@/components/auth-provider'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFasts, useFastStats } from '@/hooks/fasts/use-fasts'
import { useStartFast, useStopFast } from '@/hooks/fasts/use-fasts-mutations'

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: fastsData, isLoading: isLoadingFasts, isError: isErrorFasts } = useFasts()
  const { data: statsData, isLoading: isLoadingStats, isError: isErrorStats } = useFastStats()
  const startMutation = useStartFast()
  const stopMutation = useStopFast()
  // const isMutating = isStarting || isStopping

  const isMutating = startMutation.isPending || stopMutation.isPending
  const fasts = fastsData?.fasts ?? []
  const stats = statsData?.stats
  const currentFast = fasts.find((f) => !f.endAt) ?? null

  return (
    <>
      {/* Header page */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Dashboard</h1>
        <p className="text-sm text-slate-400">
          {user
            ? `Content de te revoir, ${user.displayName}.`
            : 'Suis tes jeûnes et ta progression.'}
        </p>
      </div>

      {/* Top cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Actions / current fast */}
        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-100">Jeûne en cours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentFast ? (
              <>
                <p className="text-sm text-slate-300">
                  Type : <span className="font-medium">{currentFast.type}</span>
                </p>
                <p className="text-xs text-slate-400">
                  Démarré le{' '}
                  {new Date(currentFast.startAt).toLocaleString('fr-FR', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => stopMutation.mutate()}
                    disabled={isMutating}
                  >
                    {stopMutation.isPending ? 'Arrêt en cours...' : 'Arrêter le jeûne'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-300">
                  Aucun jeûne en cours. Lance un 16:8 pour commencer.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => startMutation.mutate()} disabled={isMutating}>
                    {startMutation.isPending ? 'Démarrage...' : 'Démarrer un 16:8'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="border-slate-800 bg-slate-900/70 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-100">Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <p className="text-xs text-slate-400">Chargement des stats...</p>
            ) : isErrorStats ? (
              <p className="text-xs text-red-400">Impossible de charger les stats.</p>
            ) : stats ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase">Jeûnes complétés</p>
                  <p className="text-xl font-semibold text-slate-50">{stats.totalFasts}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase">Heures totales</p>
                  <p className="text-xl font-semibold text-slate-50">
                    {stats.totalHours.toFixed(1)} h
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 uppercase">Streak actuel</p>
                  <p className="text-xl font-semibold text-slate-50">
                    {stats.currentStreakDays} jour(s)
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Aucune statistique pour le moment. Commence ton premier jeûne 🚀
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent fasts */}
      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-100">Derniers jeûnes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingFasts ? (
            <p className="text-xs text-slate-400">Chargement des derniers jeûnes...</p>
          ) : isErrorFasts ? (
            <p className="text-xs text-red-400">Impossible de charger les jeûnes.</p>
          ) : fasts.length === 0 ? (
            <p className="text-xs text-slate-400">
              Aucun jeûne pour l&apos;instant. Lance-en un pour voir ton historique ici.
            </p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {fasts.map((f) => (
                <li key={f.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-100">{f.type}</p>
                    <p className="text-xs text-slate-400">
                      Début :{' '}
                      {new Date(f.startAt).toLocaleString('fr-FR', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                      {f.endAt && (
                        <>
                          {' '}
                          – Fin :{' '}
                          {new Date(f.endAt).toLocaleString('fr-FR', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">{f.endAt ? 'Terminé' : 'En cours'}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  )
}
