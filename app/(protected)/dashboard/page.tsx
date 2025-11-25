'use client'

import { useAuth } from '@/components/auth-provider'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFastingPresets, useFasts, useFastStats } from '@/hooks/fasts/use-fasts'
import { useStartFast, useStopFast } from '@/hooks/fasts/use-fasts-mutations'
import { Progress } from '@/components/ui/progress'
import { useMemo, useState } from 'react'
import { FastingPreset } from '@/types/fasts'
import { cn } from '@/lib/utils'
import { formatDurationH } from '@/lib/time'
import { useFastTimer } from '@/hooks/fasts/use-fast-timer'

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: fastsData, isLoading: isLoadingFasts, isError: isErrorFasts } = useFasts()
  const { data: statsData, isLoading: isLoadingStats, isError: isErrorStats } = useFastStats()
  const startMutation = useStartFast()
  const stopMutation = useStopFast()
  const {
    data: presetsData,
    isLoading: isLoadingPresets,
    isError: isErrorPresets
  } = useFastingPresets()

  const presets = presetsData?.presets ?? []
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)

  const defaultPresetId = useMemo(() => {
    if (!presets.length) return '16_8'
    const sixteen = presets.find((p) => p.id === '16_8')
    return sixteen?.id ?? presets[0].id
  }, [presets])

  const effectivePresetId = selectedPresetId ?? defaultPresetId
  const isMutating = startMutation.isPending || stopMutation.isPending
  const fasts = fastsData?.fasts ?? []
  const stats = statsData?.stats
  const currentFast = fasts.find((f) => !f.endAt) ?? null
  const timer = useFastTimer(currentFast)

  const selectedPreset: FastingPreset | undefined = presets.find((p) => p.id === effectivePresetId)
  const currentPresetForFast: FastingPreset | undefined =
    currentFast && currentFast.targetDurationHours
      ? presets.find((p) => p.fastingHours === currentFast.targetDurationHours)
      : presets.find((p) => p.id === currentFast?.type)

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
        {/* Jeûne en cours / démarrage */}
        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium text-slate-100">Jeûne en cours</CardTitle>
              {currentFast && (
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-[11px] font-medium',
                    timer.phase === 'FASTING_WINDOW' &&
                      'bg-amber-500/10 text-amber-300 border border-amber-500/40',
                    timer.phase === 'EATING_WINDOW' &&
                      'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40',
                    timer.phase === 'OUTSIDE_WINDOWS' &&
                      'bg-slate-700/40 text-slate-300 border border-slate-600/60'
                  )}
                >
                  {timer.phase === 'FASTING_WINDOW'
                    ? 'Fenêtre de jeûne'
                    : timer.phase === 'EATING_WINDOW'
                    ? 'Fenêtre d’alimentation'
                    : 'Hors fenêtres'}
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Choix du type de jeûne */}
            {isLoadingPresets ? (
              <p className="text-xs text-slate-400">Chargement des types de jeûne...</p>
            ) : isErrorPresets ? (
              <p className="text-xs text-red-400">Impossible de charger les types de jeûne.</p>
            ) : presets.length === 0 ? (
              <p className="text-xs text-slate-400">
                Aucun type de jeûne configuré pour l’instant.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 uppercase">Type de jeûne</p>
                <div className="flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs transition-colors',
                        p.id === effectivePresetId
                          ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                          : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                      )}
                      onClick={() => setSelectedPresetId(p.id)}
                      disabled={!!currentFast} // on ne change pas pendant un jeûne
                    >
                      {p.label}{' '}
                      <span className="text-[10px] text-slate-500">
                        ({p.fastingHours}h / {p.eatingHours}h)
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Zone de status / minuteur */}
            {currentFast ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-300">
                  Type :{' '}
                  <span className="font-medium">
                    {currentPresetForFast?.label ?? currentFast.type}
                  </span>
                </p>

                {currentFast.targetDurationHours && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>
                        {timer.phase === 'FASTING_WINDOW'
                          ? 'Temps de jeûne'
                          : timer.phase === 'EATING_WINDOW'
                          ? 'Temps de jeûne réalisé'
                          : 'Temps de jeûne total'}
                      </span>
                      <span>
                        {formatDurationH(timer.elapsedHours)} /{' '}
                        {formatDurationH(currentFast.targetDurationHours)}
                      </span>
                    </div>
                    {timer.progress !== null && (
                      <Progress value={timer.progress * 100} className="h-2" />
                    )}
                    <p className="text-xs text-slate-400">
                      {timer.phase === 'FASTING_WINDOW' && !timer.isOverTarget
                        ? `Encore ~${formatDurationH(
                            timer.remainingHours ?? 0
                          )} pour atteindre ton objectif.`
                        : timer.phase === 'FASTING_WINDOW' && timer.isOverTarget
                        ? 'Tu as dépassé ton objectif de jeûne 🎉 Tu peux stopper quand tu veux.'
                        : timer.phase === 'EATING_WINDOW'
                        ? 'Fenêtre d’alimentation : mange de façon consciente et équilibrée. 🥗'
                        : 'Fenêtres planifiées terminées pour ce cycle.'}
                    </p>
                  </div>
                )}

                <p className="text-xs text-slate-500">
                  Démarré le{' '}
                  {new Date(currentFast.startAt).toLocaleString('fr-FR', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })}
                </p>

                {currentFast.fastTargetEndAt && (
                  <p className="text-[11px] text-slate-500">
                    Fin de la fenêtre de jeûne prévue :{' '}
                    {new Date(currentFast.fastTargetEndAt).toLocaleString('fr-FR', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </p>
                )}

                {currentFast.eatingWindowStartAt && currentFast.eatingWindowEndAt && (
                  <p className="text-[11px] text-slate-500">
                    Fenêtre d’alimentation :{' '}
                    {new Date(currentFast.eatingWindowStartAt).toLocaleTimeString('fr-FR', {
                      timeStyle: 'short'
                    })}{' '}
                    –{' '}
                    {new Date(currentFast.eatingWindowEndAt).toLocaleTimeString('fr-FR', {
                      timeStyle: 'short'
                    })}
                  </p>
                )}

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
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-300">
                  Aucun jeûne en cours. Choisis un type puis lance ton jeûne.
                </p>
                {selectedPreset && (
                  <p className="text-xs text-slate-400">
                    Tu as sélectionné <span className="font-medium">{selectedPreset.label}</span> :{' '}
                    {selectedPreset.fastingHours}h de jeûne / {selectedPreset.eatingHours}h de
                    fenêtre d&apos;alimentation.
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => startMutation.mutate()}
                    disabled={isMutating || !presets.length}
                  >
                    {startMutation.isPending ? 'Démarrage...' : 'Démarrer le jeûne'}
                  </Button>
                </div>
              </div>
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

      {/* Derniers jeûnes */}
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
