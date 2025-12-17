'use client'

import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useRecipeList } from '@/hooks/recipes/use-recipes'
import type { RecipeSummary } from '@/types/recipes'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { RecipeFormDialog } from '@/components/recipes/recipe-form-dialog'
import { useDeleteRecipe } from '@/hooks/recipes/use-recipes'
import { toast } from 'sonner'
import { isApiError } from '@/lib/errors'
import { RecipeCard } from '@/components/recipes/recipe-card'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

export default function RecipesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<RecipeSummary | null>(null)
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useRecipeList({ scope: 'me' })
  const deleteMutation = useDeleteRecipe()

  const recipes = data?.recipes ?? []

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return recipes
    return recipes.filter((r) => {
      const hay = `${r.title} ${r.description ?? ''} ${(r.tags ?? []).join(' ')}`.toLowerCase()
      return hay.includes(q)
    })
  }, [recipes, search])

  const handleCreateClick = () => {
    setEditingRecipe(null)
    setDialogOpen(true)
  }

  const handleEditClick = (recipe: RecipeSummary) => {
    setEditingRecipe(recipe)
    setDialogOpen(true)
  }

  const handleDelete = async (recipe: RecipeSummary) => {
    if (!window.confirm(`Supprimer la recette "${recipe.title}" ?`)) return
    try {
      await deleteMutation.mutateAsync({ id: recipe.id, scope: 'me' })
      toast.success('Recette supprimée', {
        description: `"${recipe.title}" a été supprimée.`
      })
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur', {
          description: err.message ?? 'Impossible de supprimer la recette.'
        })
      } else {
        toast.error('Erreur', {
          description: 'Impossible de supprimer la recette.'
        })
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Mes recettes</h1>
          <p className="text-sm text-slate-500">
            Crée ton carnet de recettes adaptées à ton jeûne.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/recipes/explore">Explorer</Link>
          </Button>
          <Button size="sm" onClick={handleCreateClick}>
            <Plus className="mr-1 h-4 w-4" />
            Nouvelle recette
          </Button>
        </div>
      </div>

      <RecipeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        recipeId={editingRecipe?.id ?? null}
        initialRecipe={editingRecipe ?? undefined}
      />

      {/* Search (optionnel mais utile) */}
      <Card>
        <CardContent className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une recette…"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Ton carnet</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">Chargement de tes recettes...</p>
          ) : isError ? (
            <p className="text-sm text-red-500">Impossible de charger tes recettes.</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500">
              Tu n&apos;as pas encore de recette (ou aucune ne correspond à la recherche).
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((r) => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  onDelete={() => handleDelete(r)}
                  onEdit={() => handleEditClick(r)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
