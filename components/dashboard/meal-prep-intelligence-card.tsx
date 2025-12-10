'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import { useGenerateMealPlan } from '@/hooks/meal-plans/use-generate-meal-plan'
import { useCreateFoodEntry } from '@/hooks/food/use-food'
import { isApiError } from '@/lib/errors'
import type { MealPlan, MealPlanMeal } from '@/types/meal-plan'
import { mealPlanFormSchema, MealPlanFormValues } from '@/schemas/meal-plan.schemas'
import { z } from 'zod'
import {
  ActivityLevel,
  estimateCaloriesFromProfile,
  getDefaultCaloriesForGoal,
  Goal,
  Sex
} from '@/lib/caloriesCalulator'

function formatKcal(k: number | undefined) {
  if (!k || !Number.isFinite(k)) return ''
  return `${Math.round(k)} kcal`
}

function todayYmd() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

type Props = {
  locale?: 'en' | 'fr' | 'de'
}

export function MealPrepIntelligenceCard({ locale = 'fr' }: Props) {
  const [calcOpen, setCalcOpen] = useState(false)
  const [calcSex, setCalcSex] = useState<Sex>('male')
  const [calcActivity, setCalcActivity] = useState<ActivityLevel>('MODERATE')
  const [calcAge, setCalcAge] = useState<number | ''>('')
  const [calcHeight, setCalcHeight] = useState<number | ''>('')
  const [calcWeight, setCalcWeight] = useState<number | ''>('')

  const form = useForm({
    resolver: zodResolver(mealPlanFormSchema),
    defaultValues: {
      days: 3,
      // use undefined for optional numeric target to match schema (avoid `'' as any`)
      dailyCaloriesTarget: undefined,
      goal: 'WEIGHT_LOSS',
      dietStyle: 'NONE',
      intolerances: ''
    }
  })

  const generateMutation = useGenerateMealPlan()
  const day = useMemo(() => todayYmd(), [])
  const createEntryMutation = useCreateFoodEntry(day)

  const plan: MealPlan | undefined = generateMutation.data?.plan

  const onSubmit = async (values: MealPlanFormValues) => {
    const intolerances =
      values.intolerances
        ?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? []

    try {
      await generateMutation.mutateAsync({
        days: values.days,
        dailyCaloriesTarget: values.dailyCaloriesTarget,
        goal: values.goal,
        dietStyle: values.dietStyle,
        intolerances,
        locale
      })
      toast.success('Plan repas généré', {
        description: 'Ton plan personnalisé est prêt.'
      })
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur', {
          description: err.message ?? 'Impossible de générer le plan repas.'
        })
      } else {
        toast.error('Erreur', {
          description: 'Impossible de générer le plan repas.'
        })
      }
    }
  }

  const handleAddMealToJournal = async (meal: MealPlanMeal) => {
    try {
      await createEntryMutation.mutateAsync({
        label: meal.title,
        calories: meal.calories
      })
      toast.success('Repas ajouté au journal', {
        description: `${meal.title} a été ajouté pour aujourd'hui.`
      })
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur', {
          description: err.message ?? "Impossible d'ajouter ce repas."
        })
      } else {
        toast.error('Erreur', {
          description: "Impossible d'ajouter ce repas."
        })
      }
    }
  }

  const goal = form.watch('goal')
  const currentCaloriesRaw = form.watch('dailyCaloriesTarget')

  // const handleGoalChange = useCallback(
  //   (v: string) => form.setValue('goal', v as z.infer<typeof mealPlanFormSchema>['goal']),
  //   [form]
  // )

  const handleDietStyleChange = useCallback(
    (v: string) => form.setValue('dietStyle', v as z.infer<typeof mealPlanFormSchema>['dietStyle']),
    [form]
  )

  return (
    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-100">
          Meal Prep Intelligence (Premium)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulaire */}
        <form
          className="space-y-3 rounded-md border border-slate-800 bg-slate-950/60 p-3"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-200">Objectif</Label>
              {/* <Select value={form.watch('goal')} onValueChange={handleGoalChange}> */}
              <Select
                value={goal}
                onValueChange={(v) => {
                  const newGoal = v as Goal
                  form.setValue('goal', newGoal)

                  // si aucune valeur n'est encore saisie, on applique un preset
                  const current = form.getValues('dailyCaloriesTarget')
                  if (!current) {
                    const preset = getDefaultCaloriesForGoal(newGoal)
                    form.setValue('dailyCaloriesTarget', String(preset))
                  }
                }}
              >
                <SelectTrigger className="h-8 text-xs text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="WEIGHT_LOSS">Perte de poids</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintien</SelectItem>
                  <SelectItem value="MUSCLE_GAIN">Prise de muscle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-200">Jours</Label>
              <Input
                type="number"
                min={1}
                max={7}
                className="h-8 text-xs text-slate-200"
                {...form.register('days', { valueAsNumber: true })}
              />
              {form.formState.errors.days && (
                <p className="text-[11px] text-red-400">{form.formState.errors.days.message}</p>
              )}
            </div>

            {/* <div className="space-y-1.5">
              <Label className="text-xs text-slate-200">
                Calories / jour (optionnel, min 1000)
              </Label>
              <Input
                type="number"
                min={1000}
                max={5000}
                className="h-8 text-xs text-slate-200"
                placeholder="ex : 1800"
                {...form.register('dailyCaloriesTarget')}
              />
              {form.formState.errors.dailyCaloriesTarget && (
                <p className="text-[11px] text-red-400">
                  {form.formState.errors.dailyCaloriesTarget.message?.toString() ??
                    'Doit être entre 1000 et 5000 kcal ou laissé vide.'}
                </p>
              )}
            </div> */}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs text-slate-200">
                  Calories / jour (optionnel, 1000–5000)
                </Label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => {
                      const g = form.getValues('goal') as Goal
                      const preset = getDefaultCaloriesForGoal(g)
                      form.setValue('dailyCaloriesTarget', String(preset))
                      toast.success('Preset appliqué', {
                        description: `Calories par jour ajustées à ~${preset} kcal selon ton objectif.`
                      })
                    }}
                  >
                    Utiliser preset
                  </Button>

                  <Dialog open={calcOpen} onOpenChange={setCalcOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        size="default"
                        variant="outline"
                        className="h-6 px-2 text-[10px]"
                      >
                        Calculer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm border-slate-800 bg-slate-950 text-slate-100">
                      <DialogHeader>
                        <DialogTitle className="text-sm">Calculer mon besoin calorique</DialogTitle>
                        <DialogDescription className="text-xs text-slate-400">
                          Estimation basée sur ton profil (approximation, pas un avis médical).
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-3 py-1 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Sexe</Label>
                            <Select value={calcSex} onValueChange={(v) => setCalcSex(v as Sex)}>
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="text-xs">
                                <SelectItem value="male">Homme</SelectItem>
                                <SelectItem value="female">Femme</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Âge</Label>
                            <Input
                              type="number"
                              min={14}
                              max={100}
                              className="h-7 text-xs"
                              value={calcAge}
                              onChange={(e) =>
                                setCalcAge(e.target.value ? Number(e.target.value) : '')
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Taille (cm)</Label>
                            <Input
                              type="number"
                              min={130}
                              max={220}
                              className="h-7 text-xs"
                              value={calcHeight}
                              onChange={(e) =>
                                setCalcHeight(e.target.value ? Number(e.target.value) : '')
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Poids (kg)</Label>
                            <Input
                              type="number"
                              min={40}
                              max={200}
                              className="h-7 text-xs"
                              value={calcWeight}
                              onChange={(e) =>
                                setCalcWeight(e.target.value ? Number(e.target.value) : '')
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Activité</Label>
                          <Select
                            value={calcActivity}
                            onValueChange={(v) => setCalcActivity(v as ActivityLevel)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="text-xs">
                              <SelectItem value="SEDENTARY">
                                Sédentaire (bureau, peu de sport)
                              </SelectItem>
                              <SelectItem value="LIGHT">Léger (1–2 séances / semaine)</SelectItem>
                              <SelectItem value="MODERATE">
                                Modéré (3–4 séances / semaine)
                              </SelectItem>
                              <SelectItem value="ACTIVE">Actif (5+ séances / semaine)</SelectItem>
                              <SelectItem value="ATHLETE">Très actif / athlète</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <DialogFooter className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCalcOpen(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            if (
                              !calcAge ||
                              !calcHeight ||
                              !calcWeight ||
                              !Number.isFinite(calcAge) ||
                              !Number.isFinite(calcHeight) ||
                              !Number.isFinite(calcWeight)
                            ) {
                              toast.error('Données incomplètes', {
                                description: 'Renseigne au moins ton âge, ta taille et ton poids.'
                              })
                              return
                            }

                            const goal = form.getValues('goal') as Goal
                            const { maintenance, target } = estimateCaloriesFromProfile({
                              sex: calcSex,
                              age: calcAge as number,
                              heightCm: calcHeight as number,
                              weightKg: calcWeight as number,
                              activity: calcActivity,
                              goal
                            })

                            form.setValue('dailyCaloriesTarget', String(target))
                            setCalcOpen(false)
                            toast.success('Calories estimées', {
                              description: `Maintenance ~${maintenance} kcal, cible ~${target} kcal/jour selon ton objectif.`
                            })
                          }}
                        >
                          Utiliser ce calcul
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* input + éventuelle erreur */}
              <Input
                type="number"
                min={1000}
                max={5000}
                className="h-8 text-xs text-slate-200"
                placeholder="ex : 1800"
                {...form.register('dailyCaloriesTarget')}
              />
              {form.formState.errors.dailyCaloriesTarget && (
                <p className="text-[11px] text-red-400">
                  {form.formState.errors.dailyCaloriesTarget.message?.toString() ??
                    'Doit être entre 1000 et 5000 kcal ou laissé vide.'}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-200">Style alimentaire</Label>
              <Select value={form.watch('dietStyle')} onValueChange={handleDietStyleChange}>
                <SelectTrigger className="h-8 text-xs text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="NONE">Aucun spécifique</SelectItem>
                  <SelectItem value="VEGETARIAN">Végétarien</SelectItem>
                  <SelectItem value="VEGAN">Vegan</SelectItem>
                  <SelectItem value="KETO">Keto</SelectItem>
                  <SelectItem value="LOW_CARB">Low carb</SelectItem>
                  <SelectItem value="MEDITERRANEAN">Méditerranéen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-200">
                Intolérances (séparées par des virgules)
              </Label>
              <Input
                className="h-8 text-xs text-slate-200"
                placeholder="ex: gluten, lactose"
                {...form.register('intolerances')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" size="sm" disabled={generateMutation.isPending}>
              {generateMutation.isPending ? 'Génération...' : 'Générer un plan repas'}
            </Button>
          </div>
        </form>

        {/* Résultat */}
        {generateMutation.isPending && !plan && (
          <p className="text-xs text-slate-400">Génération du plan repas en cours...</p>
        )}

        {plan && (
          <div className="space-y-3">
            {plan.coachNotes && (
              <div className="rounded-md border border-emerald-700/60 bg-emerald-950/40 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                  Notes du coach
                </p>
                <p className="mt-1 text-xs text-emerald-100">{plan.coachNotes}</p>
              </div>
            )}

            <ScrollArea className="max-h-[380px] rounded-md border border-slate-800 bg-slate-950/40 p-3">
              <div className="space-y-4">
                {plan.days.map((dayPlan) => (
                  <div
                    key={dayPlan.dayIndex}
                    className="rounded-md border border-slate-800 bg-slate-900/70 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-100">{dayPlan.label}</p>
                        <p className="text-[11px] text-slate-400">
                          Total ~{Math.round(dayPlan.totalCalories)} kcal
                        </p>
                      </div>
                    </div>

                    <Separator className="my-2 bg-slate-800" />

                    <div className="space-y-3">
                      {dayPlan.meals.map((meal, idx) => (
                        <div
                          key={`${meal.mealType}-${idx}`}
                          className="rounded-md border border-slate-800 bg-slate-950/60 p-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-slate-600 text-[10px]">
                                  {meal.mealType === 'BREAKFAST'
                                    ? 'Petit-déj'
                                    : meal.mealType === 'LUNCH'
                                    ? 'Déjeuner'
                                    : meal.mealType === 'DINNER'
                                    ? 'Dîner'
                                    : 'Snack'}
                                </Badge>
                                <p className="text-xs font-medium text-slate-100">{meal.title}</p>
                              </div>
                              <p className="text-[11px] text-slate-400">{meal.description}</p>
                              <p className="text-[11px] text-slate-300">
                                {formatKcal(meal.calories)}{' '}
                                {meal.proteinGrams != null && (
                                  <>• {Math.round(meal.proteinGrams)}g prot</>
                                )}{' '}
                                {meal.carbsGrams != null && (
                                  <> • {Math.round(meal.carbsGrams)}g glucides</>
                                )}{' '}
                                {meal.fatGrams != null && (
                                  <> • {Math.round(meal.fatGrams)}g lipides</>
                                )}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 border-slate-700 text-[11px]"
                              disabled={createEntryMutation.isPending}
                              onClick={() => void handleAddMealToJournal(meal)}
                            >
                              +
                            </Button>
                          </div>

                          <div className="mt-2 grid gap-2 text-[11px] text-slate-300 sm:grid-cols-2">
                            <div>
                              <p className="mb-0.5 font-semibold text-slate-200">Ingrédients</p>
                              <ul className="list-disc space-y-0.5 pl-4">
                                {meal.ingredients.map((ing, i) => (
                                  <li key={i}>{ing}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="mb-0.5 font-semibold text-slate-200">Étapes</p>
                              <ol className="list-decimal space-y-0.5 pl-4">
                                {meal.steps.map((step, i) => (
                                  <li key={i}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          </div>

                          {meal.notes && (
                            <p className="mt-1 text-[11px] text-slate-400">Note : {meal.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
