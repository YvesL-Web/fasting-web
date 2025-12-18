// components/dashboard/food-journal-card.tsx
'use client'

import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { foodEntryFormSchema } from '@/schemas/food.schemas'
import { FastTimerState } from '@/hooks/fasts/use-fast-timer'
import { Fast } from '@/types/fasts'
import { useCreateFoodEntry, useDeleteFoodEntry, useFoodEntries } from '@/hooks/food/use-food'
import { toast } from 'sonner'
import { isApiError } from '@/lib/errors'
import { useState } from 'react'
import { useFoodSearch } from '@/hooks/food/use-food-search'
import { FoodItem, FoodEntry } from '@/types/food'
import { ScrollArea } from '@/components/ui/scroll-area'

import { FoodScanSuggestion } from '@/types/food-scanner'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { DeleteFoodEntryAlert } from '@/components/food/delete-food-entry-alert'
import { EditFoodEntryDialog } from '@/components/food/edit-food-entry-dialog' // ✅ ton dialog
import { FoodScanButton } from '../dashboard/food-scan-button'

type Props = {
  today: string
  currentFast: Fast | null
  timer: FastTimerState
}

export function FoodJournalCard({ today, currentFast, timer }: Props) {
  const { data, isLoading, isError } = useFoodEntries(today)
  const createEntryMutation = useCreateFoodEntry(today)
  const deleteMutation = useDeleteFoodEntry(today)

  const entries = data?.entries ?? []

  const form = useForm({
    resolver: zodResolver(foodEntryFormSchema),
    defaultValues: {
      label: '',
      calories: undefined
    }
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)

  const { data: searchData, isLoading: isSearching } = useFoodSearch(searchTerm)
  const searchResults = searchData?.items ?? []

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<FoodEntry | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [entryToEdit, setEntryToEdit] = useState<FoodEntry | null>(null)

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

  const openDelete = (entry: FoodEntry) => {
    setEntryToDelete(entry)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!entryToDelete) return
    try {
      await deleteMutation.mutateAsync({ id: entryToDelete.id })
      toast.success('Entrée supprimée')
    } catch (err) {
      toast.error('Erreur', {
        description: isApiError(err)
          ? err.message ?? 'Impossible de supprimer.'
          : 'Impossible de supprimer.'
      })
    } finally {
      setDeleteOpen(false)
      setEntryToDelete(null)
    }
  }

  const openEdit = (entry: FoodEntry) => {
    setEntryToEdit(entry)
    setEditOpen(true)
  }

  return (
    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium text-slate-100">
            Journal alimentaire (aujourd’hui)
          </CardTitle>

          {currentFast && (
            <span
              className={cn(
                'rounded-full px-2 py-1 text-[11px] font-medium border',
                timer.phase === 'FASTING_WINDOW' &&
                  'bg-amber-500/10 text-amber-300 border-amber-500/40',
                timer.phase === 'EATING_WINDOW' &&
                  'bg-emerald-500/10 text-emerald-300 border-emerald-500/40',
                timer.phase === 'OUTSIDE_WINDOWS' &&
                  'bg-slate-700/40 text-slate-300 border-slate-600/60'
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

        {/* ✅ Create form */}
        <form
          className="space-y-3 rounded-md border border-slate-800 bg-slate-950/60 p-3"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
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
            {isSearching && <p className="mt-1 text-[11px] text-slate-400">Recherche...</p>}

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

          <FoodScanButton onSuggestionClick={handleScanSuggestion} />

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

        {/* ✅ list */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Repas du jour
          </p>

          {isLoading ? (
            <p className="text-xs text-slate-400">Chargement...</p>
          ) : isError ? (
            <p className="text-xs text-red-400">Impossible de charger les entrées.</p>
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
                    className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-medium text-slate-100 truncate">
                        {entry.label}{' '}
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
                    </div>

                    <div className="ml-3 flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap',
                          badgeClass
                        )}
                      >
                        {badgeLabel}
                      </span>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEdit(entry)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Éditer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={() => openDelete(entry)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* dialogs */}
        <DeleteFoodEntryAlert
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={confirmDelete}
          isLoading={deleteMutation.isPending}
          title="Supprimer cette entrée ?"
          description="Cette entrée sera supprimée de ton journal et des statistiques."
        />

        <EditFoodEntryDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          entry={entryToEdit}
          day={today}
        />
      </CardContent>
    </Card>
  )
}
