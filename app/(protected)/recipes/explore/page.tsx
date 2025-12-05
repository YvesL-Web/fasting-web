'use client'

import { useState, useMemo } from 'react'
import { useRecipeList } from '@/hooks/recipes/use-recipes'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { PublicRecipeCard } from '@/components/recipes/public-recipe-card'

export default function RecipesExplorePage() {
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState<string | null>(null)

  const debouncedSearch = useDebouncedValue(search, 300)

  const { data, isLoading, isError } = useRecipeList({
    scope: 'public',
    search: debouncedSearch || undefined,
    tag: tagFilter || undefined
  })

  const recipes = data?.recipes ?? []

  // tags “simples” construits à partir des recettes chargées
  const availableTags = useMemo(() => {
    const set = new Set<string>()
    for (const r of recipes) {
      for (const t of r.tags) {
        set.add(t)
      }
    }
    return Array.from(set).sort()
  }, [recipes])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Catalogue de recettes</h1>
          <p className="text-sm text-slate-500">
            Explore les recettes publiques partagées par la communauté.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Filtrer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-600">Recherche</p>
            <Input
              placeholder="Recherche par titre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-600">Tags</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="icon"
                variant={tagFilter === null ? 'default' : 'outline'}
                onClick={() => setTagFilter(null)}
              >
                Tous
              </Button>
              {availableTags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  size="icon"
                  variant={tagFilter === tag ? 'default' : 'outline'}
                  onClick={() => setTagFilter((prev) => (prev === tag ? null : tag))}
                >
                  {tag}
                </Button>
              ))}
              {availableTags.length === 0 && (
                <p className="text-xs text-slate-400">Aucun tag détecté pour le moment.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recettes publiques</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-slate-500">Chargement des recettes...</p>
          ) : isError ? (
            <p className="text-sm text-red-500">Impossible de charger le catalogue.</p>
          ) : recipes.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aucune recette publique trouvée pour ces filtres.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recipes.map((r) => (
                <PublicRecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
