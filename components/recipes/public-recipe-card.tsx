import { RecipeSummary } from '@/types/recipes'
import { Badge } from '../ui/badge'
import { Clock, Flame, Globe2, User } from 'lucide-react'

type PublicRecipeCardProps = {
  recipe: RecipeSummary
}

export function PublicRecipeCard({ recipe }: PublicRecipeCardProps) {
  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0)

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {recipe.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={recipe.imageUrl} alt={recipe.title} className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-slate-400 text-xs">
          Pas d&apos;image
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="line-clamp-1 text-sm font-semibold">{recipe.title}</h2>
            <p className="line-clamp-2 text-xs text-slate-500">
              {recipe.description ?? 'Aucune description.'}
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe2 className="h-3 w-3" />
            Public
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <User className="h-3 w-3" />
            {recipe.author.displayName}
          </span>
          {totalTime > 0 && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {totalTime} min
            </span>
          )}
          {recipe.totalCalories != null && (
            <span className="inline-flex items-center gap-1">
              <Flame className="h-3 w-3" />
              {recipe.totalCalories} kcal
            </span>
          )}
        </div>

        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="text-[10px] text-slate-400">+{recipe.tags.length - 3} tag(s)</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
