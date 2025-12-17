'use client'

import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'

// Fasting hooks & components (adapte les chemins/noms si besoin)

import { useFastTimer } from '@/hooks/fasts/use-fast-timer'

import { FastPresetSelector } from '@/components/fasts/fast-preset-selector'
import { isApiError } from '@/lib/errors'

// Food
import { FoodJournalCard } from '@/components/dashboard/food-journal-card'
import { FoodJournalStatsCard } from '@/components/dashboard/food-journal-stats-card'

// IA / Meal prep
import { MealPrepIntelligenceCard } from '@/components/dashboard/meal-prep-intelligence-card'
// Coach IA (adapte le chemin si besoin)
import { useFastCoachFeedback } from '@/hooks/coach/use-fast-coach-feedback'
import { PremiumGuard } from '@/components/premium-guard'

// types
import type { Fast, FastingPreset } from '@/types/fasts'
import { useFastingPresets, useFasts, useFastStats } from '@/hooks/fasts/use-fasts'
import { useStartFast, useStopFast } from '@/hooks/fasts/use-fasts-mutations'
import { FASTING_PRESETS } from '@/constants/fasting-presets'
import { formatDateYMD, formatHMSFromMs, formatShortDurationFromHours } from '@/lib/time'
import { Progress } from '@/components/ui/progress'
import { CoachFeedbackCard } from '@/components/dashboard/coach-feedback-card'

export default function DashboardPage() {
  const { user } = useAuth()
  const todayYmd = useMemo(() => formatDateYMD(new Date()), [])
  const [userPresetId, setUserPresetId] = useState<string | null>(null)

  // Fasts
  const { data: fastsData, isLoading: isLoadingFasts } = useFasts()
  const { data: statsData, isLoading: isLoadingStats } = useFastStats()
  const { data: presetsData } = useFastingPresets()

  const fasts = fastsData?.fasts ?? []
  const currentFast = fasts.find((f) => !f.endAt) ?? null
  const hasActiveFast = !!currentFast && currentFast.endAt === null

  const timer = useFastTimer(currentFast)
  const lastFast = useMemo(() => (fasts.length > 0 ? fasts[0] : null), [fasts])

  const startFastMutation = useStartFast()
  const stopFastMutation = useStopFast()

  const isMutatingFast = startFastMutation.isPending || stopFastMutation.isPending

  const stats = statsData?.stats

  const autoPresetId = useMemo(() => {
    if (currentFast?.type) return currentFast.type
    if (lastFast?.type) return lastFast.type
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

  const handleStopFast = async () => {
    if (!currentFast) return
    try {
      await stopFastMutation.mutateAsync()
      toast.success('Jeûne terminé', {
        description: 'Bravo pour ce jeûne !'
      })
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur', {
          description: err.message ?? 'Impossible de stopper le jeûne.'
        })
      } else {
        toast.error('Erreur', {
          description: 'Impossible de stopper le jeûne.'
        })
      }
    }
  }

  // Coach IA feedback

  const presets = presetsData?.presets ?? []
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

  return (
    <div className="space-y-4">
      {/* Header dashboard */}
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-400">Dashboard</p>
          <h1 className="text-lg font-semibold text-slate-50">
            Bonjour{user?.displayName ? `, ${user.displayName}` : ''} 👋
          </h1>
          <p className="text-xs text-slate-400">
            Suis ton jeûne, ton alimentation et laisse l’IA t’aider à garder le cap.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">
            Aujourd&apos;hui
          </span>
          <span className="text-xs font-medium text-slate-200">
            {new Date().toLocaleDateString(user?.locale ?? 'fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'short'
            })}
          </span>
        </div>
      </section>

      {/* Tabs principales */}
      <Tabs defaultValue="fasting" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 gap-2 bg-slate-900/60 p-1">
          <TabsTrigger value="fasting" className="text-xs">
            Jeûne
          </TabsTrigger>
          <TabsTrigger value="food" className="text-xs">
            Alimentation
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs">
            IA & Plans repas
          </TabsTrigger>
        </TabsList>

        {/* TAB : JEÛNE */}
        <TabsContent value="fasting" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
            {/* Colonne gauche : Timer + actions */}
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-medium text-slate-100">
                    Jeûne en cours
                  </CardTitle>
                  {currentFast ? (
                    <Badge
                      variant="outline"
                      className={cn(
                        'border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-300'
                      )}
                    >
                      En cours
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-slate-600/60 bg-slate-800/60 text-[10px] text-slate-300"
                    >
                      Aucun jeûne actif
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Timer simple */}
                <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3 text-center">
                  {isLoadingFasts ? (
                    <p className="text-xs text-slate-400">Chargement du jeûne...</p>
                  ) : currentFast ? (
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Type de jeûne
                      </p>
                      <p className="text-sm font-semibold text-slate-50">{currentFast.type}</p>
                      <Separator className="my-2 bg-slate-800" />
                      <p className="text-xs text-slate-400">
                        Durée écoulée:{' '}
                        <span className="font-semibold text-slate-100">{elapsedLabel}</span>
                      </p>
                      {currentPresetForFast && (
                        <p className="text-xs text-slate-400">
                          Objectif:{' '}
                          <span className="font-semibold text-slate-100">
                            {currentPresetForFast.label}{' '}
                            <span className="text-[11px] text-slate-400">
                              ({currentPresetForFast.fastingHours}h jeûne)
                            </span>
                          </span>
                        </p>
                      )}
                      <p className="text-xs text-slate-400">
                        Phase actuelle:{' '}
                        <span
                          className={cn(
                            'font-semibold',
                            timer.phase === 'FASTING_WINDOW' && 'text-amber-300',
                            timer.phase === 'EATING_WINDOW' && 'text-emerald-300',
                            timer.phase === 'OUTSIDE_WINDOWS' && 'text-slate-300'
                          )}
                        >
                          {timer.phase === 'FASTING_WINDOW'
                            ? 'Fenêtre de jeûne'
                            : timer.phase === 'EATING_WINDOW'
                            ? 'Fenêtre d’alimentation'
                            : 'Hors fenêtres'}
                        </span>
                      </p>
                      <Separator />
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
                              {new Date(currentFast.eatingWindowStartAt).toLocaleTimeString(
                                'fr-FR',
                                {
                                  timeStyle: 'short'
                                }
                              )}{' '}
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
                  ) : (
                    <p className="text-xs text-slate-400">
                      Aucun jeûne actif pour le moment. Configure ton prochain jeûne ci-dessous.
                    </p>
                  )}
                </div>

                {/* Presets + actions */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    {/* <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Type de jeûne
                    </p> */}
                    <FastPresetSelector
                      value={selectedPresetId}
                      onChange={handlePresetChange}
                      disabled={hasActiveFast}
                    />
                    {currentFast && (
                      <p className="text-[11px] text-slate-500">
                        Le type de jeûne ne peut pas être modifié pendant un jeûne en cours.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      disabled={isMutatingFast || !!currentFast || !presets?.length}
                      onClick={handleStartFast}
                    >
                      {startFastMutation.isPending ? 'Démarrage...' : 'Démarrer un jeûne'}
                    </Button>
                    {currentFast && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isMutatingFast}
                        onClick={() => void handleStopFast()}
                      >
                        {stopFastMutation.isPending ? 'Arrêt...' : 'Arrêter le jeûne'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Colonne droite : Stats de jeûne */}
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-100">
                  Statistiques de jeûne
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingStats ? (
                  <p className="text-xs text-slate-400">Chargement des statistiques...</p>
                ) : !stats ? (
                  <p className="text-xs text-slate-400">
                    Aucune statistique encore. Commence ton premier jeûne pour voir tes progrès ici.
                  </p>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1 rounded-md border border-slate-800 bg-slate-950/60 p-2.5">
                        <p className="text-[11px] uppercase text-slate-500">Jeûnes complétés</p>
                        <p className="text-lg font-semibold text-slate-50">
                          {stats.totalFasts ?? 0}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Tu construis petit à petit ta discipline.
                        </p>
                      </div>
                      <div className="space-y-1 rounded-md border border-slate-800 bg-slate-950/60 p-2.5">
                        <p className="text-[11px] uppercase text-slate-500">Heures totales</p>
                        <p className="text-lg font-semibold text-slate-50">
                          {Math.round(stats.totalHours ?? 0)} h
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Soit ~{Math.round((stats.totalHours ?? 0) / (stats.totalFasts || 1))} h
                          par jeûne.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1 rounded-md border border-slate-800 bg-slate-950/60 p-2.5">
                        <p className="text-[11px] uppercase text-slate-500">Plus long jeûne</p>
                        <p className="text-lg font-semibold text-slate-50">
                          {Math.round(stats.longestFastHours ?? 0)} h
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Objectif : battre ce record en restant à l’écoute de ton corps.
                        </p>
                      </div>
                      <div className="space-y-1 rounded-md border border-slate-800 bg-slate-950/60 p-2.5">
                        <p className="text-[11px] uppercase text-slate-500">Streak actuel</p>
                        <p className="text-lg font-semibold text-slate-50">
                          {stats.currentStreakDays ?? 0} jour(s)
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Un jour à la fois. La cohérence gagne toujours.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB : ALIMENTATION */}
        <TabsContent value="food" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
            <FoodJournalCard
              today={todayYmd}
              currentFast={currentFast as Fast | null}
              timer={timer}
            />
            <FoodJournalStatsCard />
          </div>
        </TabsContent>

        {/* TAB : IA & MEAL PREP */}
        <TabsContent value="ai" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)]">
            {/* Coach IA */}
            <CoachFeedbackCard />
            {/* Meal Prep Intelligence (Premium) */}
            <PremiumGuard>
              <MealPrepIntelligenceCard locale={user?.locale ?? 'fr'} />
            </PremiumGuard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
