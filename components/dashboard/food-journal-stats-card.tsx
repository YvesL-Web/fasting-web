'use client'

import { subDays } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFoodSummary } from '@/hooks/food/use-food-summary'
import { formatDateYMD } from '@/lib/time'

export function FoodJournalStatsCard() {
  const today = new Date()
  const to = formatDateYMD(today)
  const from = formatDateYMD(subDays(today, 6)) // 7 derniers jours

  const { data, isLoading, isError } = useFoodSummary({ from, to })

  const days = data?.days ?? []

  const totalCalories = days.reduce((sum, d) => sum + d.totalCalories, 0)
  const totalInWindow = days.reduce((sum, d) => sum + d.inWindowCalories, 0)
  const totalOutWindow = days.reduce((sum, d) => sum + d.outWindowCalories, 0)
  const daysCount = days.length || 1
  const avgPerDay = totalCalories / daysCount
  const ratioInWindow = totalCalories > 0 ? Math.round((totalInWindow / totalCalories) * 100) : 0

  const chartData =
    days.length === 0
      ? []
      : days.map((d) => ({
          // on n'affiche que MM-DD pour alléger
          day: d.day.slice(5),
          inWindow: d.inWindowCalories,
          outWindow: d.outWindowCalories
        }))

  return (
    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-100">
          Statistiques alimentation (7 derniers jours)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-xs text-slate-400">Chargement des statistiques...</p>
        ) : isError ? (
          <p className="text-xs text-red-400">
            Impossible de charger les statistiques alimentaires.
          </p>
        ) : days.length === 0 ? (
          <p className="text-xs text-slate-400">
            Aucun repas enregistré sur les 7 derniers jours. Ajoute des entrées dans ton journal
            pour voir des stats ici.
          </p>
        ) : (
          <>
            {/* Résumé */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-[11px] uppercase text-slate-500">Total calories</p>
                <p className="text-lg font-semibold text-slate-50">
                  {Math.round(totalCalories)} kcal
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] uppercase text-slate-500">Moyenne / jour</p>
                <p className="text-lg font-semibold text-slate-50">{Math.round(avgPerDay)} kcal</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] uppercase text-slate-500">Dans la fenêtre</p>
                <p className="text-lg font-semibold text-slate-50">
                  {ratioInWindow}%{' '}
                  <span className="text-[11px] text-slate-400">
                    ({Math.round(totalInWindow)} kcal)
                  </span>
                </p>
              </div>
            </div>

            {/* Graphique */}
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} stackOffset="none">
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: '#1e293b',
                      borderRadius: 8
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-[11px] text-slate-300">{value}</span>
                    )}
                  />
                  <Bar dataKey="inWindow" name="Dans la fenêtre" stackId="a" fill="#22c55e" />
                  <Bar dataKey="outWindow" name="Hors fenêtre" stackId="a" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
