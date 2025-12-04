'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useRecipeList } from '@/hooks/recipes/use-recipes'
import type { RecipeSummary } from '@/types/recipes'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { RecipeFormDialog } from '@/components/recipes/recipe-form-dialog'
import { useDeleteRecipe } from '@/hooks/recipes/use-recipes'
import { toast } from 'sonner'
import { isApiError } from '@/lib/errors'
import { RecipeCard } from '@/components/recipes/recipe-card'

export default function RecipesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<RecipeSummary | null>(null)

  const { data, isLoading, isError } = useRecipeList({ scope: 'me' })
  const deleteMutation = useDeleteRecipe()

  const recipes = data?.recipes ?? []

  const handleCreateClick = () => {
    setEditingRecipe(null)
    setDialogOpen(true)
  }

  const handleEditClick = (recipe: RecipeSummary) => {
    // pour la v1, on réutilise RecipeSummary comme base
    setEditingRecipe({
      ...recipe,
      // on aura les ingredients/steps seulement dans le détail
      // mais pour la v1, on les laisse vides à l’édition depuis la liste
      // tu pourras plus tard récupérer le détail avant d’ouvrir le dialog
      // ici on se concentre sur le flux de création
      ingredients: [] as unknown as Array<unknown>,
      steps: [] as unknown as Array<unknown>
    } as unknown as RecipeSummary)
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
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Mes recettes</h1>
          <p className="text-sm text-slate-500">
            Crée ton carnet de recettes adaptées à ton jeûne.
          </p>
        </div>
        <Button size="sm" onClick={handleCreateClick}>
          <Plus className="mr-1 h-4 w-4" />
          Nouvelle recette
        </Button>
      </div>

      <RecipeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        existing={null /* pour l’instant, v1 = création seulement */}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Ton carnet</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">Chargement de tes recettes...</p>
          ) : isError ? (
            <p className="text-sm text-red-500">Impossible de charger tes recettes.</p>
          ) : recipes.length === 0 ? (
            <p className="text-sm text-slate-500">
              Tu n&apos;as pas encore créé de recette. Clique sur &quot;Nouvelle recette&quot; pour
              commencer ✨
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recipes.map((r) => (
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
