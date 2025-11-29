'use client'

import { useState, useMemo } from 'react'
import { addDays, subDays } from 'date-fns'
import { useRouter } from 'next/navigation'

import { FoodJournalCard } from '@/components/dashboard/food-journal-card'
import { FoodJournalStatsCard } from '@/components/dashboard/food-journal-stats-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { useFastTimer } from '@/hooks/fasts/use-fast-timer'
import { formatDateYMD } from '@/lib/time'
import { useFasts } from '@/hooks/fasts/use-fasts'

export default function NutritionPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const todayYMD = useMemo(() => formatDateYMD(new Date()), [])
  const selectedDayYMD = useMemo(() => formatDateYMD(selectedDate), [selectedDate])

  const { data: currentFastData } = useFasts()

  const fasts = currentFastData?.fasts ?? []

  const currentFast = fasts.find((f) => !f.endAt) ?? null
  const timer = useFastTimer(currentFast)

  const goPrevDay = () => {
    setSelectedDate((d) => subDays(d, 1))
  }

  const goNextDay = () => {
    setSelectedDate((d) => {
      const next = addDays(d, 1)
      // on ne dépasse pas aujourd'hui
      const today = new Date()
      if (next > today) return d
      return next
    })
  }

  const isToday = selectedDayYMD === todayYMD

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header simple de la page */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-base font-semibold text-slate-50">Nutrition</h1>
            <p className="text-xs text-slate-400">
              Journal alimentaire + stats sur les 7 derniers jours.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => router.push('/dashboard')}
          >
            Retour au dashboard
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 lg:flex-row">
        {/* Colonne gauche : Journal du jour */}
        <div className="flex-1 space-y-4">
          {/* Sélecteur de jour */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between gap-2 py-3">
              <CardTitle className="text-xs font-medium text-slate-100">Jour sélectionné</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" className="h-7 w-7" onClick={goPrevDay}>
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-xs font-medium text-slate-100">
                  {selectedDate.toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short'
                  })}
                  {isToday && (
                    <span className="ml-1 text-[10px] text-emerald-400">• Aujourd’hui</span>
                  )}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7"
                  onClick={goNextDay}
                  disabled={isToday}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-2 text-[11px] text-slate-400">
              Les repas enregistrés seront associés à ce jour, avec calcul automatique de &quot;dans
              la fenêtre / hors fenêtre&quot; selon ton jeûne.
            </CardContent>
          </Card>

          {/* Journal alimentaire pour le jour sélectionné */}
          <FoodJournalCard today={selectedDayYMD} currentFast={currentFast} timer={timer} />
        </div>

        {/* Colonne droite : stats 7 derniers jours */}
        <div className="w-full shrink-0 lg:w-80">
          <FoodJournalStatsCard />
        </div>
      </main>
    </div>
  )
}
