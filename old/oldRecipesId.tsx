'use client'

import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, PlusCircle, Flame, Clock, User } from 'lucide-react'

import { useRecipeDetail } from '@/hooks/recipes/use-recipes'
import { useCreateFoodEntry } from '@/hooks/food/use-food'
import { isApiError } from '@/lib/errors'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

function todayYMD() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id ?? null

  const { data, isLoading, isError } = useRecipeDetail(id, true)
  const recipe = data?.recipe

  const day = useMemo(() => todayYMD(), [])
  const addToJournal = useCreateFoodEntry(day)

  const totalTime = recipe ? (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0) : 0

  const handleAdd = async () => {
    if (!recipe) return
    try {
      await addToJournal.mutateAsync({
        label: recipe.title,
        calories: recipe.totalCalories ?? null,
        proteinGrams: recipe.proteinGrams ?? null,
        carbsGrams: recipe.carbsGrams ?? null,
        fatGrams: recipe.fatGrams ?? null,
        recipeId: recipe.id
      })

      toast.success('Ajouté au journal', {
        description: 'Entrée ajoutée à ton journal alimentaire.'
      })
    } catch (err) {
      toast.error('Erreur', {
        description: isApiError(err)
          ? err.message ?? "Impossible d'ajouter."
          : "Impossible d'ajouter."
      })
    }
  }

  if (isLoading) return <p className="text-sm text-slate-500">Chargement…</p>
  if (isError || !recipe) return <p className="text-sm text-red-500">Recette introuvable.</p>

  return (
    <div className="flex flex-col gap-4">
      {/* top actions */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Button size="sm" onClick={handleAdd} disabled={addToJournal.isPending}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {addToJournal.isPending ? 'Ajout…' : 'Ajouter au journal'}
        </Button>
      </div>

      {/* hero */}
      <Card className="overflow-hidden">
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.imageUrl} alt={recipe.title} className="h-56 w-full object-cover" />
        ) : (
          <div className="flex h-56 w-full items-center justify-center bg-slate-100 text-slate-400 text-xs">
            Pas d&apos;image
          </div>
        )}

        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-lg">{recipe.title}</CardTitle>
              <p className="text-sm text-slate-500">
                {recipe.description ?? 'Aucune description.'}
              </p>
            </div>

            <Badge variant={recipe.isPublic ? 'outline' : 'secondary'}>
              {recipe.isPublic ? 'Public' : 'Privé'}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {recipe.author && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {recipe.author.displayName}
              </span>
            )}
            {totalTime > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {totalTime} min
              </span>
            )}
            {recipe.totalCalories != null && (
              <span className="inline-flex items-center gap-1">
                <Flame className="h-3.5 w-3.5" />
                {recipe.totalCalories} kcal
              </span>
            )}
            {recipe.servings != null && <span>{recipe.servings} portion(s)</span>}
          </div>

          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <Separator />

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-semibold">Ingrédients</p>
              {recipe.ingredients.length === 0 ? (
                <p className="text-sm text-slate-500">Aucun ingrédient.</p>
              ) : (
                <ul className="space-y-2">
                  {recipe.ingredients.map((it, idx) => (
                    <li key={idx} className="rounded-md border p-3">
                      <p className="text-sm font-medium">{it.name}</p>
                      {it.quantity ? <p className="text-xs text-slate-500">{it.quantity}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Étapes</p>
              {recipe.steps.length === 0 ? (
                <p className="text-sm text-slate-500">Aucune étape.</p>
              ) : (
                <ol className="space-y-2">
                  {recipe.steps
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((s, idx) => (
                      <li key={idx} className="rounded-md border p-3">
                        <p className="text-xs font-semibold text-slate-500">Étape {idx + 1}</p>
                        <p className="text-sm whitespace-pre-line">{s.text}</p>
                      </li>
                    ))}
                </ol>
              )}
            </div>
          </div>

          <Separator />

          {/* macros */}
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-md border p-3">
              <p className="text-[11px] text-slate-500">Calories</p>
              <p className="text-sm font-semibold">{recipe.totalCalories ?? '—'} kcal</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-[11px] text-slate-500">Protéines</p>
              <p className="text-sm font-semibold">{recipe.proteinGrams ?? '—'} g</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-[11px] text-slate-500">Glucides</p>
              <p className="text-sm font-semibold">{recipe.carbsGrams ?? '—'} g</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-[11px] text-slate-500">Lipides</p>
              <p className="text-sm font-semibold">{recipe.fatGrams ?? '—'} g</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
