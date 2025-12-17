'use client'

import Link from 'next/link'
import { subDays } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useFoodSummary } from '@/hooks/food/use-food-summary'

function formatDateYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function FoodJournalStatsCard() {
  const today = new Date()
  const to = formatDateYMD(today)
  const from = formatDateYMD(subDays(today, 6))

  const { data, isLoading, isError } = useFoodSummary({ from, to })

  const days = data?.days ?? []
  const topRecipes = data?.topRecipes ?? []

  const totalCalories = days.reduce((sum, d) => sum + d.totalCalories, 0)
  const totalInWindow = days.reduce((sum, d) => sum + d.inWindowCalories, 0)
  const totalOutWindow = days.reduce((sum, d) => sum + d.outWindowCalories, 0)
  const totalPostFast = days.reduce((sum, d) => sum + d.postFastCalories, 0)

  const daysCount = days.length || 1
  const avgPerDay = totalCalories / daysCount

  const ratioInWindow = totalCalories > 0 ? Math.round((totalInWindow / totalCalories) * 100) : 0
  const ratioPostFast = totalCalories > 0 ? Math.round((totalPostFast / totalCalories) * 100) : 0

  const chartData =
    days.length === 0
      ? []
      : days.map((d) => ({
          day: d.day.slice(5),
          inWindow: d.inWindowCalories,
          outWindow: d.outWindowCalories,
          postFast: d.postFastCalories
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
          <p className="text-xs text-slate-400">Aucun repas enregistré sur les 7 derniers jours.</p>
        ) : (
          <>
            {/* Résumé */}
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <p className="text-[11px] uppercase text-slate-500">Total</p>
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
              <div className="space-y-1">
                <p className="text-[11px] uppercase text-slate-500">Post-jeûne</p>
                <p className="text-lg font-semibold text-slate-50">
                  {ratioPostFast}%{' '}
                  <span className="text-[11px] text-slate-400">
                    ({Math.round(totalPostFast)} kcal)
                  </span>
                </p>
              </div>
            </div>

            {/* Graph */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} stackOffset="none">
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: '#1e293b',
                      borderRadius: 8
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend
                    formatter={(v) => <span className="text-[11px] text-slate-300">{v}</span>}
                  />
                  <Bar dataKey="inWindow" name="Dans la fenêtre" stackId="a" fill="#22c55e" />
                  <Bar dataKey="outWindow" name="Hors fenêtre" stackId="a" fill="#f97316" />
                  <Bar dataKey="postFast" name="Post-jeûne" stackId="b" fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <Separator className="bg-slate-800" />

            {/* Top recipes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Recettes les plus utilisées
                </p>
                <Badge variant="secondary" className="text-[11px]">
                  {topRecipes.length}
                </Badge>
              </div>

              {topRecipes.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Aucune recette utilisée dans le journal sur cette période.
                </p>
              ) : (
                <ul className="space-y-2">
                  {topRecipes.slice(0, 5).map((r) => (
                    <li
                      key={r.recipeId}
                      className="flex items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-md border border-slate-800 bg-slate-900">
                          {r.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={r.imageUrl}
                              alt={r.title}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/recipes/${r.recipeId}`}
                            className="block truncate text-xs font-medium text-slate-100 hover:underline"
                          >
                            {r.title}
                          </Link>
                          <p className="text-[11px] text-slate-500">
                            {r.uses} fois • {Math.round(r.totalCalories)} kcal cumulées
                          </p>
                        </div>
                      </div>

                      <Badge variant="outline" className="text-[11px]">
                        Top
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
