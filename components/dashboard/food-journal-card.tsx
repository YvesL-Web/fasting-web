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
import { useCreateFoodEntry, useFoodEntries } from '@/hooks/food/use-food'
import { toast } from 'sonner'
import { isApiError } from '@/lib/errors'

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
    defaultValues: {
      label: '',
      calories: undefined
    }
  })

  const onSubmit = async (values: z.infer<typeof foodEntryFormSchema>) => {
    try {
      await createEntryMutation.mutateAsync({
        label: values.label,
        calories: values.calories
      })
      form.reset({ label: '', calories: undefined })
      toast.success('Entrée ajoutée', {
        description: 'Ton repas a été ajouté au journal.'
      })
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur', {
          description: err?.message ?? "Impossible d'ajouter ce repas."
        })
      } else {
        toast.error('Erreur', {
          description: "Impossible d'ajouter ce repas."
        })
      }
    }
  }

  const phaseMessage =
    timer.phase === 'FASTING_WINDOW'
      ? 'Tu es actuellement en fenêtre de jeûne. Évite de manger si possible 🧊'
      : timer.phase === 'EATING_WINDOW'
      ? 'Tu es dans ta fenêtre d’alimentation 🍽️ — privilégie des repas de qualité.'
      : 'Hors fenêtres planifiées. Si tu manges maintenant, ce sera compté hors fenêtre.'

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
        {/* Message de contexte */}
        <p className="text-xs text-slate-400">{phaseMessage}</p>

        {/* Formulaire */}
        <form
          className="space-y-3 rounded-md border border-slate-800 bg-slate-950/60 p-3"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
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

        {/* Liste des entrées */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Repas du jour
          </p>

          {isLoading ? (
            <p className="text-xs text-slate-400">Chargement du journal...</p>
          ) : isError ? (
            <p className="text-xs text-red-400">Impossible de charger les entrées alimentaires.</p>
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
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-100">{entry.label}</p>
                      <p className="text-[11px] text-slate-500">
                        {time}
                        {entry.calories != null && <> • {entry.calories} kcal</>}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'ml-3 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                        badgeClass
                      )}
                    >
                      {badgeLabel}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
