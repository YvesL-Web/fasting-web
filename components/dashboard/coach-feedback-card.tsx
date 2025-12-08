'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { isApiError } from '@/lib/errors'
import { useFastCoachFeedback } from '@/hooks/coach/use-fast-coach-feedback'
import { FastCoachFeedbackInput, FastCoachGoal } from '@/types/coach'
import { PremiumBadge } from '../premium-badge'
import { PremiumGuard } from '../premium-guard'

const coachFormSchema = z.object({
  mainGoal: z.enum(['weight_loss', 'energy', 'health', 'maintenance']).default('weight_loss'),
  mood: z.string().max(200).optional(),
  notes: z.string().max(1000).optional()
})

type CoachFormValues = z.infer<typeof coachFormSchema>

export function CoachFeedbackCard() {
  const mutation = useFastCoachFeedback()

  const form = useForm({
    resolver: zodResolver(coachFormSchema),
    defaultValues: {
      mainGoal: 'weight_loss',
      mood: '',
      notes: ''
    }
  })

  const onSubmit = async (values: CoachFormValues) => {
    const payload: FastCoachFeedbackInput = {
      mainGoal: values.mainGoal as FastCoachGoal,
      mood: values.mood || undefined,
      notes: values.notes || undefined
    }

    try {
      await mutation.mutateAsync(payload)
      toast.success('Analyse générée', {
        description: 'Le coach a analysé tes jeûnes et ton alimentation.'
      })
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur coach', {
          description: err.message ?? "Impossible d'obtenir une analyse pour le moment."
        })
      } else {
        toast.error('Erreur coach', {
          description: "Impossible d'obtenir une analyse pour le moment."
        })
      }
    }
  }

  const feedback = mutation.data?.message ?? ''

  return (
    <PremiumGuard>
      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-100">Analyse du coach IA</CardTitle>
          <PremiumBadge />
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-slate-400">
            Donne quelques infos sur ton objectif et comment tu te sens. Le coach analysera tes
            jeûnes, tes calories (dont la phase post-jeûne) et tes recettes les plus utilisées pour
            te donner des conseils personnalisés.
          </p>

          <form
            className="space-y-3 rounded-md border border-slate-800 bg-slate-950/60 p-3"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            {/* Objectif principal */}
            <div className="space-y-1.5">
              <Label htmlFor="mainGoal" className="text-xs text-slate-200">
                Objectif principal
              </Label>
              <Select
                value={form.watch('mainGoal')}
                onValueChange={(value) =>
                  form.setValue('mainGoal', value as CoachFormValues['mainGoal'])
                }
              >
                <SelectTrigger className="h-8 text-xs text-slate-200">
                  <SelectValue placeholder="Choisis un objectif" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="weight_loss">Perte de poids</SelectItem>
                  <SelectItem value="energy">Énergie / Vitalité</SelectItem>
                  <SelectItem value="health">Santé métabolique</SelectItem>
                  <SelectItem value="maintenance">Maintien / Habitude</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Humeur */}
            <div className="space-y-1.5">
              <Label htmlFor="mood" className="text-xs text-slate-200">
                Comment tu te sens ces derniers jours ? (optionnel)
              </Label>
              <Input
                id="mood"
                placeholder="Ex : Fatigué, faim le soir, bonne énergie..."
                className="text-xs text-slate-200"
                {...form.register('mood')}
              />
              {form.formState.errors.mood && (
                <p className="text-[11px] text-red-400">{form.formState.errors.mood.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs text-slate-200">
                Notes additionnelles (optionnel)
              </Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Ajoute des détails : difficultés, changements récents, type de recettes que tu manges le plus..."
                className="text-xs text-slate-200"
                {...form.register('notes')}
              />
              {form.formState.errors.notes && (
                <p className="text-[11px] text-red-400">{form.formState.errors.notes.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                {mutation.isPending ? 'Analyse en cours...' : 'Demander une analyse'}
              </Button>
            </div>
          </form>

          {/* Résultat du coach */}
          {mutation.isPending && !feedback && (
            <p className="text-xs text-slate-400">Le coach prépare ton analyse...</p>
          )}

          {feedback && (
            <div className="space-y-2 rounded-md border border-slate-800 bg-slate-950/80 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Feedback du coach
              </p>
              <p className="whitespace-pre-line text-xs leading-relaxed text-slate-100">
                {feedback}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </PremiumGuard>
  )
}
