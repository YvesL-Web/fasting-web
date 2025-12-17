// components/food/edit-food-entry-dialog.tsx
'use client'

import { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

import { isApiError } from '@/lib/errors'
import type { FoodEntry } from '@/types/food'
import { useUpdateFoodEntry } from '@/hooks/food/use-food'
import { foodEntryEditFormSchema, FoodEntryEditFormValues } from '@/schemas/food.schemas'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  day: string // YYYY-MM-DD (clé react-query)
  entry: FoodEntry | null
}

function toDatetimeLocal(iso: string) {
  // "2025-12-16T10:51:05.276Z" -> "2025-12-16T11:51" (selon timezone locale)
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

function fromDatetimeLocal(local: string) {
  // "YYYY-MM-DDTHH:mm" -> ISO
  // new Date(local) interprète en local timezone => OK pour ton use-case
  return new Date(local).toISOString()
}

export function EditFoodEntryDialog({ open, onOpenChange, day, entry }: Props) {
  const updateMutation = useUpdateFoodEntry(day)

  const defaults = useMemo<FoodEntryEditFormValues>(() => {
    return {
      label: entry?.label ?? '',
      calories: entry?.calories ?? undefined,
      proteinGrams: entry?.proteinGrams ?? undefined,
      carbsGrams: entry?.carbsGrams ?? undefined,
      fatGrams: entry?.fatGrams ?? undefined,
      loggedAtLocal: entry?.loggedAt
        ? toDatetimeLocal(entry.loggedAt)
        : toDatetimeLocal(new Date().toISOString()),
      isPostFast: entry?.isPostFast ?? false
    }
  }, [entry])

  const form = useForm({
    resolver: zodResolver(foodEntryEditFormSchema),
    defaultValues: defaults
  })

  // Préfill à l’ouverture (quand entry change)
  useEffect(() => {
    if (!open) return
    form.reset(defaults)
  }, [open, defaults, form])

  // Reset à la fermeture (évite états bizarres)
  useEffect(() => {
    if (!open) {
      form.reset(defaults)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = async (values: FoodEntryEditFormValues) => {
    if (!entry) return

    try {
      await updateMutation.mutateAsync({
        id: entry.id,
        input: {
          label: values.label,
          calories: values.calories ?? null,
          proteinGrams: values.proteinGrams ?? null,
          carbsGrams: values.carbsGrams ?? null,
          fatGrams: values.fatGrams ?? null,
          loggedAt: fromDatetimeLocal(values.loggedAtLocal),
          isPostFast: values.isPostFast
        }
      })

      toast.success('Repas mis à jour', { description: 'Ton entrée a été modifiée.' })
      onOpenChange(false)
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur', { description: err.message ?? 'Impossible de mettre à jour.' })
      } else {
        toast.error('Erreur', { description: 'Impossible de mettre à jour.' })
      }
    }
  }

  const isSubmitting = updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Modifier le repas</DialogTitle>
        </DialogHeader>

        {!entry ? (
          <p className="text-sm text-slate-500">Aucune entrée sélectionnée.</p>
        ) : (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" {...form.register('label')} />
              {form.formState.errors.label && (
                <p className="text-xs text-red-500">{form.formState.errors.label.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="loggedAtLocal">Date / heure</Label>
              <Input id="loggedAtLocal" type="datetime-local" {...form.register('loggedAtLocal')} />
              {form.formState.errors.loggedAtLocal && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.loggedAtLocal.message}
                </p>
              )}
              <p className="text-[11px] text-slate-500">
                Astuce : changer la date/heure recalculera automatiquement la fenêtre
                (jeûne/alimentation) côté backend.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="calories">Calories (kcal)</Label>
                <Input
                  id="calories"
                  type="number"
                  inputMode="numeric"
                  {...form.register('calories')}
                />
                {form.formState.errors.calories && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.calories.message as string}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 pt-7">
                <Checkbox
                  id="isPostFast"
                  checked={form.watch('isPostFast')}
                  onCheckedChange={(v) =>
                    form.setValue('isPostFast', Boolean(v), { shouldDirty: true })
                  }
                />
                <Label htmlFor="isPostFast" className="cursor-pointer">
                  Post-jeûne
                </Label>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="proteinGrams">Protéines (g)</Label>
                <Input
                  id="proteinGrams"
                  type="number"
                  inputMode="numeric"
                  {...form.register('proteinGrams')}
                />
                {form.formState.errors.proteinGrams && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.proteinGrams.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="carbsGrams">Glucides (g)</Label>
                <Input
                  id="carbsGrams"
                  type="number"
                  inputMode="numeric"
                  {...form.register('carbsGrams')}
                />
                {form.formState.errors.carbsGrams && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.carbsGrams.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fatGrams">Lipides (g)</Label>
                <Input
                  id="fatGrams"
                  type="number"
                  inputMode="numeric"
                  {...form.register('fatGrams')}
                />
                {form.formState.errors.fatGrams && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.fatGrams.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
