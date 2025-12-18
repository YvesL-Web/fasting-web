// app/(protected)/recipes/[id]/page.tsx
'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { isApiError } from '@/lib/errors'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRecipeDetail } from '@/hooks/recipes/use-recipes'
import { useCreateFoodEntry } from '@/hooks/food/use-food'
import { Loader2, Plus, ArrowLeft } from 'lucide-react'

function formatTodayYMD() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function toDatetimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const min = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

function fromDatetimeLocal(local: string) {
  return new Date(local).toISOString()
}

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id ?? null

  const day = useMemo(() => formatTodayYMD(), [])
  const addMutation = useCreateFoodEntry(day)

  const { data, isLoading, isError } = useRecipeDetail(id, true)
  const recipe = data?.recipe ?? null

  // UX: user-driven toggle
  const [isPostFast, setIsPostFast] = useState(true)

  // UX: allow choose time (optional)
  const [loggedAtLocal, setLoggedAtLocal] = useState(() => toDatetimeLocal(new Date()))

  const handleAddToJournal = async () => {
    if (!recipe) return

    try {
      await addMutation.mutateAsync({
        recipeId: recipe.id,
        label: recipe.title,
        calories: recipe.totalCalories ?? null,
        proteinGrams: recipe.proteinGrams ?? null,
        carbsGrams: recipe.carbsGrams ?? null,
        fatGrams: recipe.fatGrams ?? null,
        isPostFast,
        loggedAt: fromDatetimeLocal(loggedAtLocal)
      })

      toast.success('Ajouté au journal', {
        description: 'Cette recette a été ajoutée à ton journal alimentaire.'
      })
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur', { description: err.message ?? "Impossible d'ajouter au journal." })
      } else {
        toast.error('Erreur', { description: "Impossible d'ajouter au journal." })
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Button
          onClick={handleAddToJournal}
          disabled={!recipe || addMutation.isPending}
          className="hidden sm:inline-flex"
        >
          {addMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ajout...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter dans mon journal
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Chargement...
        </div>
      ) : isError || !recipe ? (
        <p className="text-sm text-red-500">Impossible de charger cette recette.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="overflow-hidden">
            {recipe.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={recipe.imageUrl} alt={recipe.title} className="h-56 w-full object-cover" />
            ) : (
              <div className="flex h-56 items-center justify-center bg-slate-100 text-xs text-slate-400">
                Pas d&apos;image
              </div>
            )}

            <CardHeader className="space-y-2">
              <CardTitle className="text-xl">{recipe.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant={recipe.isPublic ? 'outline' : 'secondary'}>
                  {recipe.isPublic ? 'Public' : 'Privé'}
                </Badge>
                {recipe.tags?.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>

              {recipe.description && <p className="text-sm text-slate-600">{recipe.description}</p>}
            </CardHeader>

            <CardContent className="space-y-4">
              <Separator />

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border p-3">
                  <p className="text-[11px] uppercase text-slate-500">Calories</p>
                  <p className="text-lg font-semibold">{recipe.totalCalories ?? '—'} kcal</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-[11px] uppercase text-slate-500">Portions</p>
                  <p className="text-lg font-semibold">{recipe.servings ?? '—'}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-[11px] uppercase text-slate-500">Temps</p>
                  <p className="text-lg font-semibold">
                    {(recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0) || '—'} min
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border p-3">
                  <p className="text-[11px] uppercase text-slate-500">Protéines</p>
                  <p className="text-lg font-semibold">{recipe.proteinGrams ?? '—'} g</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-[11px] uppercase text-slate-500">Glucides</p>
                  <p className="text-lg font-semibold">{recipe.carbsGrams ?? '—'} g</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-[11px] uppercase text-slate-500">Lipides</p>
                  <p className="text-lg font-semibold">{recipe.fatGrams ?? '—'} g</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Ingrédients</h3>
                  {recipe.ingredients?.length ? (
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {recipe.ingredients.map((i, idx) => (
                        <li key={idx}>
                          {i.name}
                          {i.quantity ? (
                            <span className="text-slate-500"> — {i.quantity}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">Aucun ingrédient.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Étapes</h3>
                  {recipe.steps?.length ? (
                    <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
                      {recipe.steps
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((s) => (
                          <li key={s.order}>{s.text}</li>
                        ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-slate-500">Aucune étape.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-sm">Ajouter au journal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Ajoute cette recette à ton journal pour améliorer tes stats et ton coach.
              </p>

              <div className="rounded-md border p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isPostFast}
                    onCheckedChange={(v) => setIsPostFast(Boolean(v))}
                  />
                  <div>
                    <p className="text-sm font-medium">Post-jeûne</p>
                    <p className="text-xs text-slate-500">
                      Coche si ce repas correspond à ta “rupture de jeûne”.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="loggedAt">Date / heure</Label>
                  <Input
                    id="loggedAt"
                    type="datetime-local"
                    value={loggedAtLocal}
                    onChange={(e) => setLoggedAtLocal(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-500">
                    Utile si tu ajoutes la recette après-coup (l’app recalculera fenêtre
                    jeûne/alimentation).
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleAddToJournal}
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? 'Ajout...' : 'Ajouter dans mon journal'}
              </Button>

              <Button
                variant="outline"
                className="w-full sm:hidden"
                onClick={handleAddToJournal}
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? 'Ajout...' : 'Ajouter'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
