'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Flame, Globe2, Lock, User, UtensilsCrossed } from 'lucide-react'

import { useRecipeDetail } from '@/hooks/recipes/use-recipes'
import { useCreateFoodEntry } from '@/hooks/food/use-food'
import type { RecipeDetail } from '@/types/recipes'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { toast } from 'sonner'
import { isApiError } from '@/lib/errors'
import { todayYmd } from '@/lib/time'

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const { data, isLoading, isError } = useRecipeDetail(id ?? null, true)
  const recipe: RecipeDetail | null = data?.recipe ?? null

  const [portionCount, setPortionCount] = useState<string>('1')

  const day = todayYmd()
  const createEntryMutation = useCreateFoodEntry(day)

  const totalTime = useMemo(() => {
    if (!recipe) return 0
    return (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0)
  }, [recipe])

  const caloriesPerPortion = useMemo(() => {
    if (!recipe || recipe.totalCalories == null || !recipe.servings || recipe.servings <= 0) {
      return null
    }
    return recipe.totalCalories / recipe.servings
  }, [recipe])

  const canAddToJournal = !!recipe && caloriesPerPortion !== null

  const handleAddToJournal = async () => {
    if (!recipe || caloriesPerPortion == null) return

    const portions = Number(portionCount.replace(',', '.'))
    if (!Number.isFinite(portions) || portions <= 0) {
      toast.error('Portions invalides', {
        description: 'Merci de saisir un nombre de portions supérieur à 0.'
      })
      return
    }

    const calories = Math.round(caloriesPerPortion * portions)

    try {
      await createEntryMutation.mutateAsync({
        label: recipe.title,
        calories,
        recipeId: recipe.id
      })
      toast.success('Ajouté au journal', {
        description: `${calories} kcal ajoutées au journal d'aujourd'hui.`
      })
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur', {
          description: err.message ?? "Impossible d'ajouter au journal."
        })
      } else {
        toast.error('Erreur', {
          description: "Impossible d'ajouter au journal."
        })
      }
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" onClick={handleBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour
        </Button>
        <div className="flex flex-col gap-4">
          <div className="h-40 w-full animate-pulse rounded-lg bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-32 w-full animate-pulse rounded bg-slate-200" />
            </div>
            <div className="h-48 w-full animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !recipe) {
    return (
      <div className="flex min-h-[60vh] flex-col gap-4">
        <Button variant="ghost" size="sm" className="w-fit" onClick={handleBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour
        </Button>
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-red-500">
              Impossible de charger cette recette. Elle a peut-être été supprimée ou rendue privée.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Bouton retour */}
      <Button variant="ghost" size="sm" className="w-fit" onClick={handleBack}>
        <ArrowLeft className="mr-1 h-4 w-4" />
        Retour
      </Button>

      {/* Image principale */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-60 w-full object-cover md:h-72"
          />
        ) : (
          <div className="flex h-60 w-full flex-col items-center justify-center gap-2 text-slate-400 md:h-72">
            <UtensilsCrossed className="h-8 w-8" />
            <p className="text-xs">Pas encore d&apos;image pour cette recette.</p>
          </div>
        )}
      </div>

      {/* Layout 2 colonnes */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        {/* Colonne principale : titre, description, ingrédients, étapes */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {recipe.isPublic ? (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Globe2 className="h-3 w-3" />
                  Public
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Privé
                </Badge>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <User className="h-3 w-3" />
                {recipe.author.displayName}
              </span>
            </div>

            <h1 className="text-2xl font-semibold leading-tight">{recipe.title}</h1>

            {recipe.description && <p className="text-sm text-slate-600">{recipe.description}</p>}

            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Ingrédients */}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-800">Ingrédients</h2>
            {recipe.ingredients.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun ingrédient détaillé.</p>
            ) : (
              <ul className="grid gap-1 sm:grid-cols-2">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={`${ing.name}-${idx}`} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <div>
                      <span className="font-medium">{ing.name}</span>
                      {ing.quantity && <span className="text-slate-500"> — {ing.quantity}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Étapes */}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-800">Étapes</h2>
            {recipe.steps.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune étape détaillée pour cette recette.</p>
            ) : (
              <ol className="space-y-3">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="flex gap-3 text-sm">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[11px] text-white">
                      {index + 1}
                    </div>
                    <p className="text-slate-700">{step.text}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* Colonne droite : infos nutrition / temps / ajout journal */}
        <div className="space-y-4">
          {/* Carte infos rapides */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Infos rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2 text-slate-600">
                {totalTime > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{totalTime} min</span>
                  </span>
                )}
                {recipe.servings != null && <span>{recipe.servings} portion(s)</span>}
                {recipe.totalCalories != null && (
                  <span className="inline-flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>{recipe.totalCalories} kcal (total)</span>
                  </span>
                )}
              </div>

              {caloriesPerPortion != null && (
                <p className="text-xs text-slate-500">
                  ≈ {Math.round(caloriesPerPortion)} kcal / portion
                </p>
              )}

              {/* On pourra plus tard afficher les macros si dispo */}
            </CardContent>
          </Card>

          {/* Carte ajout au journal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Ajouter au journal alimentaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-xs text-slate-500">
                Ajoute ce repas à ton journal d&apos;aujourd&apos;hui pour suivre tes apports.
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="portions">Nombre de portions</Label>
                <Input
                  id="portions"
                  type="number"
                  min={0.25}
                  step={0.5}
                  value={portionCount}
                  onChange={(e) => setPortionCount(e.target.value)}
                  className="max-w-[120px]"
                />
              </div>

              {caloriesPerPortion != null && (
                <p className="text-xs text-slate-500">
                  {(() => {
                    const portions = Number(portionCount.replace(',', '.'))
                    if (!Number.isFinite(portions) || portions <= 0) return null
                    const cals = Math.round(caloriesPerPortion * portions)
                    return `Environ ${cals} kcal seront ajoutées.`
                  })()}
                </p>
              )}

              {!canAddToJournal && (
                <p className="text-xs text-amber-600">
                  Calories ou portions non définies pour cette recette — tu pourras les renseigner à
                  la main dans le journal.
                </p>
              )}

              <Button
                type="button"
                size="sm"
                className="mt-1"
                disabled={!canAddToJournal || createEntryMutation.isPending}
                onClick={handleAddToJournal}
              >
                {createEntryMutation.isPending
                  ? 'Ajout en cours...'
                  : "Ajouter au journal d'aujourd'hui"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
