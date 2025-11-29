'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Sparkles } from 'lucide-react'
import { useFastCoachFeedback } from '@/hooks/coach/use-fast-coach-feedback'
import type { Fast } from '@/types/fasts'
import { toast } from 'sonner'

type Props = {
  fast: Fast
}

export function FastCoachDialog({ fast }: Props) {
  const [open, setOpen] = useState(false)

  const coachMutation = useFastCoachFeedback()

  const handleOpen = () => {
    setOpen(true)
    if (!coachMutation.data && !coachMutation.isPending) {
      coachMutation.mutate(
        { fastId: fast.id, includeFoodSummary: true, locale: 'fr' },
        {
          onError: (err) => {
            toast('Erreur coach', {
              description: err.message ?? 'Impossible de récupérer le feedback du coach.'
            })
          }
        }
      )
    }
  }

  const feedback = coachMutation.data?.feedback

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={handleOpen}
        disabled={coachMutation.isPending}
      >
        <Sparkles className="h-4 w-4" />
        {coachMutation.isPending ? 'Analyse...' : 'Avis du coach'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg border-slate-800 bg-slate-950 text-slate-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Sparkles className="h-4 w-4 text-sky-400" />
              Avis du coach sur ton jeûne
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Basé sur la durée de ton jeûne et tes habitudes alimentaires récentes.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-80 pr-2">
            {coachMutation.isPending && (
              <div className="flex items-center gap-2 py-6 text-sm text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyse de ton jeûne en cours...
              </div>
            )}

            {!coachMutation.isPending && !feedback && (
              <p className="py-4 text-sm text-slate-400">
                Impossible de récupérer un feedback pour le moment. Réessaie plus tard.
              </p>
            )}

            {feedback && (
              <div className="space-y-4 text-sm">
                <p className="whitespace-pre-line text-slate-100">{feedback.message}</p>

                {feedback.tips.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Pistes d&apos;amélioration
                    </p>
                    <ul className="space-y-1.5">
                      {feedback.tips.map((tip, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-slate-100">
                          <span className="mt-0.5 text-sky-400">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
