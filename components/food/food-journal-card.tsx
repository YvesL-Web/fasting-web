// components/dashboard/food-journal-card.tsx
'use client'

import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

import { foodEntryFormSchema } from '@/schemas/food.schemas'
import type { FastTimerState } from '@/hooks/fasts/use-fast-timer'
import type { Fast } from '@/types/fasts'
import { useCreateFoodEntry, useFoodEntries } from '@/hooks/food/use-food'
import { useFoodSearch } from '@/hooks/food/use-food-search'
import type { FoodItem, FoodEntry } from '@/types/food'
import type { FoodScanSuggestion } from '@/types/food-scanner'
import { isApiError } from '@/lib/errors'

import { EditFoodEntryDialog } from '@/components/food/edit-food-entry-dialog'
import { FoodScanButton } from '../dashboard/food-scan-button'

type Props = {
  today: string
  currentFast: Fast | null
  timer: FastTimerState
}

export function FoodJournalCard({ today, currentFast, timer }: Props) {
  const { data, isLoading, isError } = useFoodEntries(today)
  const createEntryMutation = useCreateFoodEntry(today)

  const entries = data?.entries ?? []

  const form = useForm({
    resolver: zodResolver(foodEntryFormSchema),
    defaultValues: { label: '', calories: undefined }
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)
  const { data: searchData, isLoading: isSearching } = useFoodSearch(searchTerm)
  const searchResults = searchData?.items ?? []

  // --- Edit dialog state
  const [editOpen, setEditOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)

  const openEdit = (entry: FoodEntry) => {
    setEditingEntry(entry)
    setEditOpen(true)
  }

  const handleSelectFood = (item: FoodItem) => {
    form.setValue('label', item.label, { shouldValidate: true, shouldDirty: true })
    if (item.calories != null) {
      form.setValue('calories', item.calories, { shouldValidate: true, shouldDirty: true })
    }
    setSearchTerm(item.label)
    setShowResults(false)
  }

  const handleScanSuggestion = (s: FoodScanSuggestion) => {
    form.setValue('label', s.label, { shouldValidate: true, shouldDirty: true })
    if (s.calories != null) {
      form.setValue('calories', s.calories, { shouldValidate: true, shouldDirty: true })
    }
  }

  const onSubmit = async (values: z.infer<typeof foodEntryFormSchema>) => {
    try {
      await createEntryMutation.mutateAsync({
        label: values.label,
        calories: values.calories
      })
      form.reset({ label: '', calories: undefined })
      setSearchTerm('')
      setShowResults(false)
      toast.success('Entrée ajoutée', { description: 'Ton repas a été ajouté au journal.' })
    } catch (err) {
      toast.error('Erreur', {
        description: isApiError(err)
          ? err.message ?? "Impossible d'ajouter ce repas."
          : "Impossible d'ajouter ce repas."
      })
    }
  }

  const phaseMessage =
    timer.phase === 'FASTING_WINDOW'
      ? 'Tu es actuellement en fenêtre de jeûne. Évite de manger si possible 🧊'
      : timer.phase === 'EATING_WINDOW'
      ? 'Tu es dans ta fenêtre d’alimentation 🍽️ — privilégie des repas de qualité.'
      : 'Hors fenêtres planifiées. Si tu manges maintenant, ce sera compté hors fenêtre.'

  return (
    <>
      <EditFoodEntryDialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v)
          if (!v) setEditingEntry(null)
        }}
        day={today}
        entry={editingEntry}
      />

      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-slate-100">
              Journal alimentaire (aujourd’hui)
            </CardTitle>

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
          <p className="text-xs text-slate-400">{phaseMessage}</p>

          <form
            className="space-y-3 rounded-md border border-slate-800 bg-slate-950/60 p-3"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            {/* Search food items */}
            <div className="space-y-1.5">
              <Label htmlFor="food-search" className="text-xs text-slate-200">
                Rechercher un aliment (optionnel)
              </Label>
              <Input
                id="food-search"
                placeholder="Ex : pomme, riz, poulet..."
                className="text-slate-200"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => {
                  if (searchTerm.trim().length >= 2) setShowResults(true)
                }}
              />

              {isSearching && (
                <p className="mt-1 text-[11px] text-slate-400">Recherche d&apos;aliments...</p>
              )}

              {showResults && searchTerm.trim().length >= 2 && (
                <div className="mt-1 rounded-md border border-slate-800 bg-slate-950/90">
                  {searchResults.length === 0 && !isSearching ? (
                    <p className="px-3 py-2 text-[11px] text-slate-500">
                      Aucun aliment trouvé pour &quot;{searchTerm}&quot;.
                    </p>
                  ) : (
                    <ScrollArea className="max-h-40">
                      <ul className="divide-y divide-slate-800">
                        {searchResults.map((item) => (
                          <li
                            key={item.id}
                            className="cursor-pointer px-3 py-2 text-[11px] hover:bg-slate-900/80"
                            onClick={() => handleSelectFood(item)}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="font-medium text-slate-100">{item.label}</p>
                                {item.brand && (
                                  <p className="text-[10px] text-slate-400">{item.brand}</p>
                                )}
                                {item.servingSize && (
                                  <p className="text-[10px] text-slate-500">
                                    Portion : {item.servingSize}
                                  </p>
                                )}
                              </div>
                              {item.calories != null && (
                                <p className="text-[11px] font-semibold text-slate-100">
                                  {item.calories} kcal
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  )}
                </div>
              )}
            </div>

            {/* Label */}
            <div className="space-y-1.5">
              <Label htmlFor="label" className="text-xs text-slate-200">
                Qu&apos;as-tu mangé ?
              </Label>
              <Input
                id="label"
                placeholder="Ex : Poulet + riz, pomme..."
                className="text-slate-200"
                {...form.register('label')}
              />
              {form.formState.errors.label && (
                <p className="text-[11px] text-red-400">{form.formState.errors.label.message}</p>
              )}
            </div>

            {/* IA scan */}
            <FoodScanButton onSuggestionClick={handleScanSuggestion} />

            {/* Calories */}
            <div className="space-y-1.5">
              <Label htmlFor="calories" className="text-xs text-slate-200">
                Calories (optionnel)
              </Label>
              <Input
                id="calories"
                type="number"
                inputMode="numeric"
                className="text-slate-200"
                placeholder="Ex : 450"
                {...form.register('calories')}
              />
              {form.formState.errors.calories && (
                <p className="text-[11px] text-red-400">
                  {form.formState.errors.calories.message as string}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={createEntryMutation.isPending}>
                {createEntryMutation.isPending ? 'Ajout...' : 'Ajouter'}
              </Button>
            </div>
          </form>

          {/* Entries */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Repas du jour
            </p>

            {isLoading ? (
              <p className="text-xs text-slate-400">Chargement du journal...</p>
            ) : isError ? (
              <p className="text-xs text-red-400">
                Impossible de charger les entrées alimentaires.
              </p>
            ) : entries.length === 0 ? (
              <p className="text-xs text-slate-500">
                Aucun repas enregistré aujourd&apos;hui. Ajoute ton premier repas 👇
              </p>
            ) : (
              <ul className="space-y-2">
                {entries.map((entry) => {
                  const time = new Date(entry.loggedAt).toLocaleTimeString('fr-FR', {
                    timeStyle: 'short'
                  })

                  const badgeClass = entry.inEatingWindow
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/50'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/50'

                  const badgeLabel = entry.inEatingWindow ? 'Dans la fenêtre' : 'Hors fenêtre'

                  return (
                    <li
                      key={entry.id}
                      className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-slate-100">
                            {entry.label}
                            {entry.recipe && (
                              <Link
                                href={`/recipes/${entry.recipe.id}`}
                                className="ml-2 text-[11px] text-emerald-300 underline underline-offset-2"
                              >
                                Voir la recette
                              </Link>
                            )}
                          </p>

                          <p className="text-[11px] text-slate-500">
                            {time}
                            {entry.calories != null && <> • {entry.calories} kcal</>}
                            {entry.isPostFast && (
                              <span className="ml-2 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-300">
                                Post-jeûne
                              </span>
                            )}
                          </p>

                          {(entry.proteinGrams != null ||
                            entry.carbsGrams != null ||
                            entry.fatGrams != null) && (
                            <p className="text-[11px] text-slate-500">
                              P: {entry.proteinGrams ?? '—'}g • G: {entry.carbsGrams ?? '—'}g • L:{' '}
                              {entry.fatGrams ?? '—'}g
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                              badgeClass
                            )}
                          >
                            {badgeLabel}
                          </span>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEdit(entry)}
                            aria-label="Modifier"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
