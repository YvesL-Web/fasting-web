'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/components/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FastCoachDialog } from '@/components/dashboard/fast-coach-dialog'
import { FoodJournalCard } from '@/components/dashboard/food-journal-card'
import { FastPresetSelector } from '@/components/fasts/fast-preset-selector'
import { CoachFeedbackCard } from '@/components/dashboard/coach-feedback-card'
import { FoodJournalStatsCard } from '@/components/dashboard/food-journal-stats-card'

import { useFastTimer } from '@/hooks/fasts/use-fast-timer'
import { useStartFast, useStopFast } from '@/hooks/fasts/use-fasts-mutations'
import { useFastingPresets, useFasts, useFastStats } from '@/hooks/fasts/use-fasts'

import { cn } from '@/lib/utils'
import { isApiError } from '@/lib/errors'
import { formatDateYMD, formatHMSFromMs, formatShortDurationFromHours } from '@/lib/time'

import { Fast, FastingPreset } from '@/types/fasts'
import { FASTING_PRESETS } from '@/constants/fasting-presets'
import { PremiumGuard } from '@/components/premium-guard'
import { MealPrepIntelligenceCard } from '@/components/dashboard/meal-prep-intelligence-card'

export default function DashboardPage() {
  const today = formatDateYMD(new Date())
  const { user } = useAuth()

  const { data: fastsData, isLoading: isLoadingFasts, isError: isErrorFasts } = useFasts()
  const { data: statsData, isLoading: isLoadingStats, isError: isErrorStats } = useFastStats()
  const startFastMutation = useStartFast()
  const stopMutation = useStopFast()
  const {
    data: presetsData,
    isLoading: isLoadingPresets,
    isError: isErrorPresets
  } = useFastingPresets()
  const presets = presetsData?.presets ?? []

  const [userPresetId, setUserPresetId] = useState<string | null>(null)
  const [startNotes, setStartNotes] = useState<string>('')

  const isMutating = startFastMutation.isPending || stopMutation.isPending

  const fasts = fastsData?.fasts ?? []

  const stats = statsData?.stats

  const currentFast = fasts.find((f) => !f.endAt) ?? null
  const hasActiveFast = !!currentFast && currentFast.endAt === null
  const timer = useFastTimer(currentFast)
  const lastFast = useMemo(() => (fasts.length > 0 ? fasts[0] : null), [fasts])

  const autoPresetId = useMemo(() => {
    // priorité 1 : jeûne en cours
    if (currentFast?.type) return currentFast.type
    // priorité 2 : dernier jeûne connu
    if (lastFast?.type) return lastFast.type
    // sinon on garde le default '16_8
    return '16_8'
  }, [currentFast, lastFast])

  // preset effectivement sélectionné = override utilisateur ou auto
  const selectedPresetId = userPresetId ?? autoPresetId

  const selectedPreset =
    FASTING_PRESETS.find((p) => p.id === selectedPresetId) ?? FASTING_PRESETS[0]

  const handlePresetChange = (id: string) => {
    setUserPresetId(id)
  }

  const handleStartFast = async () => {
    if (!selectedPreset) return
    if (hasActiveFast) {
      toast.error('Jeûne déjà en cours', {
        description: 'Termine ton jeûne actuel avant d’en démarrer un nouveau.'
      })
      return
    }

    try {
      await startFastMutation.mutateAsync({
        type: selectedPreset.id,
        targetDurationHours: selectedPreset.fastingHours,
        eatingHours: selectedPreset.eatingHours,
        notes: `Start ${selectedPreset.label} depuis le dashboard`
      })
      toast.success('Jeûne démarré', {
        description: `Tu as démarré un jeûne ${selectedPreset.label}.`
      })
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur', {
          description: err.message ?? 'Impossible de démarrer le jeûne.'
        })
      } else {
        toast.error('Erreur', {
          description: 'Impossible de démarrer le jeûne.'
        })
      }
    }
  }

  const currentPresetForFast: FastingPreset | undefined =
    currentFast && currentFast.targetDurationHours
      ? presets.find((p) => p.fastingHours === currentFast.targetDurationHours)
      : presets.find((p) => p.id === currentFast?.type)

  const elapsedLabel = currentFast ? formatHMSFromMs(timer.elapsedMs) : '00:00:00'

  const fastTargetRemainingLabel =
    currentFast && timer.fastTargetRemainingHours != null
      ? formatShortDurationFromHours(timer.fastTargetRemainingHours)
      : null

  const eatingWindowRemainingLabel =
    currentFast && timer.eatingWindowRemainingHours != null
      ? formatShortDurationFromHours(timer.eatingWindowRemainingHours)
      : null

  const lastCompletedFast: Fast | null =
    fasts
      .filter((f) => !!f.endAt)
      .sort((a, b) => new Date(b.endAt!).getTime() - new Date(a.endAt!).getTime())[0] ?? null

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
        {/* Jeûne en cours / démarrage / stats */}
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
                <FastPresetSelector
                  value={selectedPresetId}
                  onChange={handlePresetChange}
                  disabled={hasActiveFast}
                />
              </div>
            )}

            {/* Minuteur */}
            <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3 space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-xs uppercase text-slate-500">Temps de jeûne</p>
                  <p className="font-mono text-2xl font-semibold text-slate-50">{elapsedLabel}</p>
                </div>
                {currentFast && currentPresetForFast && (
                  <div className="text-right">
                    <p className="text-[11px] uppercase text-slate-500">Objectif</p>
                    <p className="text-sm font-medium text-slate-100">
                      {currentPresetForFast.label}{' '}
                      <span className="text-[11px] text-slate-400">
                        ({currentPresetForFast.fastingHours}h jeûne)
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {currentFast && currentFast.targetDurationHours && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Progression</span>
                    <span>
                      {timer.fastProgress !== null
                        ? `${Math.round(timer.fastProgress * 100)} %`
                        : '–'}
                    </span>
                  </div>
                  {timer.fastProgress !== null && (
                    <Progress value={timer.fastProgress * 100} className="h-2" />
                  )}
                  <p className="text-[11px] text-slate-400">
                    {timer.fastTargetRemainingHours != null && !timer.isOverFastTarget
                      ? `Encore ~${fastTargetRemainingLabel} pour atteindre ton objectif.`
                      : timer.isOverFastTarget
                      ? 'Tu as dépassé ton objectif de jeûne 🎉 Tu peux stopper quand tu veux.'
                      : 'Objectif de durée non défini.'}
                  </p>
                </div>
              )}

              {currentFast && (
                <div className="space-y-1 text-[11px] text-slate-500">
                  {currentFast.fastTargetEndAt && (
                    <p>
                      Fin de la fenêtre de jeûne prévue :{' '}
                      {new Date(currentFast.fastTargetEndAt).toLocaleString('fr-FR', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </p>
                  )}
                  {currentFast.eatingWindowStartAt && currentFast.eatingWindowEndAt && (
                    <p>
                      Fenêtre d’alimentation théorique :{' '}
                      {new Date(currentFast.eatingWindowStartAt).toLocaleTimeString('fr-FR', {
                        timeStyle: 'short'
                      })}{' '}
                      –{' '}
                      {new Date(currentFast.eatingWindowEndAt).toLocaleTimeString('fr-FR', {
                        timeStyle: 'short'
                      })}
                      {eatingWindowRemainingLabel && timer.phase === 'EATING_WINDOW' && (
                        <> • reste ~{eatingWindowRemainingLabel}</>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Form démarrage / arrêt */}
            {currentFast ? (
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-400">
                  Jeûne démarré le{' '}
                  {new Date(currentFast.startAt).toLocaleString('fr-FR', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => stopMutation.mutate()}
                  disabled={isMutating}
                >
                  {stopMutation.isPending ? 'Arrêt en cours...' : 'Arrêter le jeûne'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedPreset && (
                  <p className="text-xs text-slate-400">
                    Tu as sélectionné <span className="font-medium">{selectedPreset.label}</span> :{' '}
                    {selectedPreset.fastingHours}h de jeûne / {selectedPreset.eatingHours}h
                    d&apos;alimentation.
                  </p>
                )}
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-300">
                    Notes (optionnel) – comment tu te sens avant ce jeûne ?
                  </p>
                  <Textarea
                    rows={2}
                    placeholder="Ex : un peu fatigué, j’ai bien mangé ce midi..."
                    value={startNotes}
                    onChange={(e) => setStartNotes(e.target.value)}
                    className="resize-none text-sm text-slate-300 "
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleStartFast}
                    disabled={startFastMutation.isPending || !presets.length}
                  >
                    {startFastMutation.isPending
                      ? 'Démarrage...'
                      : `Démarrer ${selectedPreset.label}`}
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

      {/* Derniers jeûnes + Journal alimentaire */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-100">Derniers jeûnes</CardTitle>
            {lastCompletedFast && <FastCoachDialog fast={lastCompletedFast} />}
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
                    <span className="text-xs text-slate-400">
                      {f.endAt ? 'Terminé' : 'En cours'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <FoodJournalCard today={today} currentFast={currentFast} timer={timer} />
      </div>
      <div className="grid gap-4 md:grid-cols-1">
        <FoodJournalStatsCard />
      </div>
      <div className="grid gap-4 md:grid-cols-1">
        <CoachFeedbackCard />
      </div>
      <PremiumGuard>
        <MealPrepIntelligenceCard locale={user?.locale ?? 'en'} />
      </PremiumGuard>
    </>
  )
}
