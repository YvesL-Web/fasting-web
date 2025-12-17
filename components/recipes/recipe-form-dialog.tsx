'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { recipeFormSchema, type RecipeFormSchema } from '@/schemas/recipe.schemas'
import { useSaveRecipe, type RecipeFormValues } from '@/hooks/recipes/use-save-recipe'
import { toast } from 'sonner'
import { isApiError } from '@/lib/errors'
import type { RecipeDetail, RecipeSummary } from '@/types/recipes'
import { ImageIcon, Loader2, Plus, Trash2 } from 'lucide-react'
import { useRecipeDetail } from '@/hooks/recipes/use-recipes'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipeId?: string | null
  initialRecipe?: RecipeSummary
}

export function RecipeFormDialog({ open, onOpenChange, recipeId, initialRecipe }: Props) {
  const baseId = recipeId ?? initialRecipe?.id ?? null
  const isEdit = !!baseId

  const { data, isLoading: isLoadingDetail } = useRecipeDetail(baseId, open && isEdit)
  const existing: RecipeDetail | null = data?.recipe ?? null

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const saveMutation = useSaveRecipe('me')

  const form = useForm({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: initialRecipe
      ? {
          title: initialRecipe.title,
          description: initialRecipe.description ?? '',
          isPublic: initialRecipe.isPublic,
          prepTimeMinutes: initialRecipe.prepTimeMinutes?.toString() ?? '',
          cookTimeMinutes: initialRecipe.cookTimeMinutes?.toString() ?? '',
          servings: initialRecipe.servings?.toString() ?? '',
          totalCalories: initialRecipe.totalCalories?.toString() ?? '',
          proteinGrams: initialRecipe?.proteinGrams?.toString() ?? '',
          carbsGrams: initialRecipe?.carbsGrams?.toString() ?? '',
          fatGrams: initialRecipe?.fatGrams?.toString() ?? '',
          tags: initialRecipe.tags.join(', '),
          ingredients: [],
          steps: [],
          imageFile: undefined
        }
      : {
          title: '',
          description: '',
          isPublic: false,
          prepTimeMinutes: '',
          cookTimeMinutes: '',
          servings: '',
          totalCalories: '',
          proteinGrams: '',
          carbsGrams: '',
          fatGrams: '',
          tags: '',
          ingredients: [],
          steps: [],
          imageFile: undefined
        }
  })

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient
  } = useFieldArray({
    control: form.control,
    name: 'ingredients'
  })

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep
  } = useFieldArray({
    control: form.control,
    name: 'steps'
  })

  // Quand on ouvre en édition avec une autre recette : réinitialiser le form avec initialRecipe
  useEffect(() => {
    if (!open) return
    if (!isEdit || !initialRecipe) return

    form.reset({
      title: initialRecipe.title,
      description: initialRecipe.description ?? '',
      isPublic: initialRecipe.isPublic,
      prepTimeMinutes: initialRecipe.prepTimeMinutes?.toString() ?? '',
      cookTimeMinutes: initialRecipe.cookTimeMinutes?.toString() ?? '',
      servings: initialRecipe.servings?.toString() ?? '',
      totalCalories: initialRecipe.totalCalories?.toString() ?? '',
      proteinGrams: initialRecipe?.proteinGrams?.toString() ?? '',
      carbsGrams: initialRecipe?.carbsGrams?.toString() ?? '',
      fatGrams: initialRecipe?.fatGrams?.toString() ?? '',
      tags: initialRecipe.tags.join(', '),
      ingredients: [],
      steps: [],
      imageFile: undefined
    })
    setImageFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [open, isEdit, initialRecipe, form, previewUrl])

  // Quand le détail complet arrive : enrichir ingrédients + steps
  useEffect(() => {
    if (!open) return
    if (!isEdit || !existing) return

    form.reset({
      title: existing.title,
      description: existing.description ?? '',
      isPublic: existing.isPublic,
      prepTimeMinutes: existing.prepTimeMinutes?.toString() ?? '',
      cookTimeMinutes: existing.cookTimeMinutes?.toString() ?? '',
      servings: existing.servings?.toString() ?? '',
      totalCalories: existing.totalCalories?.toString() ?? '',
      proteinGrams: existing?.proteinGrams?.toString() ?? '',
      carbsGrams: existing?.carbsGrams?.toString() ?? '',
      fatGrams: existing?.fatGrams?.toString() ?? '',
      tags: existing.tags.join(', '),
      ingredients:
        existing.ingredients?.map((i) => ({
          name: i.name,
          quantity: i.quantity ?? ''
        })) ?? [],
      steps:
        existing.steps?.map((s) => ({
          text: s.text
        })) ?? [],
      imageFile: undefined
    })
  }, [open, isEdit, existing, form])

  // Reset complet à la fermeture
  useEffect(() => {
    if (!open) {
      form.reset({
        title: '',
        description: '',
        isPublic: false,
        prepTimeMinutes: '',
        cookTimeMinutes: '',
        servings: '',
        totalCalories: '',
        proteinGrams: '',
        carbsGrams: '',
        fatGrams: '',
        tags: '',
        ingredients: [],
        steps: [],
        imageFile: undefined
      })
      setImageFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    }
  }, [open, form, previewUrl])

  const onSubmit = async (values: RecipeFormSchema) => {
    const tagsArray =
      values.tags
        ?.split(',')
        .map((t) => t.trim())
        .filter(Boolean) ?? []

    const idForUpdate = baseId // clé : on utilise l'id du parent, même si existing est encore null

    const payload: RecipeFormValues = {
      id: isEdit ? idForUpdate ?? undefined : undefined,
      title: values.title,
      description: values.description ?? null,
      isPublic: values.isPublic,
      prepTimeMinutes: values.prepTimeMinutes ?? null,
      cookTimeMinutes: values.cookTimeMinutes ?? null,
      servings: values.servings ?? null,
      totalCalories: values.totalCalories ?? null,
      proteinGrams: values.proteinGrams ?? null,
      carbsGrams: values.carbsGrams ?? null,
      fatGrams: values.fatGrams ?? null,
      tags: tagsArray,
      ingredients: values.ingredients?.map((i) => ({
        name: i.name,
        quantity: i.quantity && i.quantity.trim().length > 0 ? i.quantity : null
      })),
      steps: values.steps,
      imageFile
    }

    try {
      await saveMutation.mutateAsync(payload)
      toast.success(isEdit ? 'Recette mise à jour' : 'Recette créée', {
        description: isEdit
          ? 'Ta recette a été mise à jour.'
          : 'Ta recette a été ajoutée à ton carnet.'
      })
      handleOpenChange(false)
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur', {
          description: err.message ?? "Impossible d'enregistrer la recette."
        })
      } else {
        toast.error('Erreur', {
          description: "Impossible d'enregistrer la recette."
        })
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    const url = URL.createObjectURL(file)
    setImageFile(file)
    setPreviewUrl(url)
  }

  const isSubmitting = saveMutation.isPending
  const isDialogLoading = isEdit && isLoadingDetail && open

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset()
      setImageFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    }
    onOpenChange(next)
  }

  const imageToShow = previewUrl ?? existing?.imageUrl ?? initialRecipe?.imageUrl ?? null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            {isEdit ? 'Modifier la recette' : 'Nouvelle recette'}
          </DialogTitle>
        </DialogHeader>

        {isDialogLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Chargement de la recette...
          </div>
        ) : (
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {/* Titre + visibilité */}
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input id="title" {...form.register('title')} />
              {form.formState.errors.title && (
                <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
              <div>
                <p className="text-sm font-medium">Rendre cette recette publique</p>
                <p className="text-xs text-slate-500">
                  Si activé, la communauté pourra découvrir cette recette.
                </p>
              </div>
              <Switch
                checked={form.watch('isPublic')}
                onCheckedChange={(v) => form.setValue('isPublic', v)}
              />
            </div>

            {/* Image + preview */}
            <div className="space-y-2">
              <Label>Image (optionnel)</Label>
              <div className="flex items-center gap-3">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-slate-50">
                  {imageToShow ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageToShow} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-slate-300" />
                  )}
                </div>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
              </div>
              {initialRecipe?.imageUrl && !previewUrl && isEdit && (
                <p className="text-xs text-slate-500">
                  Une image est déjà associée à cette recette.
                </p>
              )}
              {previewUrl && (
                <p className="text-xs text-slate-500">
                  Nouvelle image sélectionnée (l&apos;ancienne sera remplacée).
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Ex : Recette idéale pour rompre un jeûne de 16h..."
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Infos rapides */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="prepTimeMinutes">Préparation (min)</Label>
                <Input
                  id="prepTimeMinutes"
                  type="number"
                  inputMode="numeric"
                  {...form.register('prepTimeMinutes')}
                />
                {form.formState.errors.prepTimeMinutes && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.prepTimeMinutes.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="cookTimeMinutes">Cuisson (min)</Label>
                <Input
                  id="cookTimeMinutes"
                  type="number"
                  inputMode="numeric"
                  {...form.register('cookTimeMinutes')}
                />
                {form.formState.errors.cookTimeMinutes && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.cookTimeMinutes.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="servings">Portions</Label>
                <Input
                  id="servings"
                  type="number"
                  inputMode="numeric"
                  {...form.register('servings')}
                />
                {form.formState.errors.servings && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.servings.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Calories + tags */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="totalCalories">Calories totales (kcal)</Label>
                <Input
                  id="totalCalories"
                  type="number"
                  inputMode="numeric"
                  {...form.register('totalCalories')}
                />
                {form.formState.errors.totalCalories && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.totalCalories.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="petit-dej, post-jeûne, protéiné..."
                  {...form.register('tags')}
                />
                <p className="text-xs text-slate-500">
                  Séparés par des virgules (ex: petit-dej, léger, post-jeûne)
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="proteinGrams">Protéines (g)</Label>
                <Input
                  id="proteinGrams"
                  type="number"
                  inputMode="numeric"
                  {...form.register('proteinGrams')}
                />
                {form.formState.errors.proteinGrams && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.proteinGrams.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="carbsGrams">Glucides (g)</Label>
                <Input
                  id="carbsGrams"
                  type="number"
                  inputMode="numeric"
                  {...form.register('carbsGrams')}
                />
                {form.formState.errors.carbsGrams && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.carbsGrams.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="fatGrams">Lipides (g)</Label>
                <Input
                  id="fatGrams"
                  type="number"
                  inputMode="numeric"
                  {...form.register('fatGrams')}
                />
                {form.formState.errors.fatGrams && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.fatGrams.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Ingrédients */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ingrédients</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => appendIngredient({ name: '', quantity: '' })}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Ajouter
                </Button>
              </div>

              {ingredientFields.length === 0 && (
                <p className="text-xs text-slate-500">
                  Ajoute des ingrédients pour détailler la recette.
                </p>
              )}

              <div className="space-y-2">
                {ingredientFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 rounded-md border border-slate-200 p-2">
                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Ex : Poulet"
                        {...form.register(`ingredients.${index}.name` as const)}
                      />
                      <Input
                        placeholder="Ex : 150 g"
                        {...form.register(`ingredients.${index}.quantity` as const)}
                      />
                      {form.formState.errors.ingredients?.[index]?.name && (
                        <p className="text-xs text-red-500">
                          {form.formState.errors.ingredients[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Étapes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Étapes</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => appendStep({ text: '' })}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Ajouter
                </Button>
              </div>

              {stepFields.length === 0 && (
                <p className="text-xs text-slate-500">
                  Ajoute des étapes pour expliquer la préparation.
                </p>
              )}

              <div className="space-y-2">
                {stepFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 rounded-md border border-slate-200 p-2">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-slate-500">Étape {index + 1}</Label>
                      <Textarea
                        rows={2}
                        placeholder="Ex : Préchauffer le four à 180°C..."
                        {...form.register(`steps.${index}.text` as const)}
                      />
                      {form.formState.errors.steps?.[index]?.text && (
                        <p className="text-xs text-red-500">
                          {form.formState.errors.steps[index]?.text?.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStep(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || isDialogLoading}>
                {isSubmitting
                  ? isEdit
                    ? 'Enregistrement...'
                    : 'Création...'
                  : isEdit
                  ? 'Enregistrer'
                  : 'Créer'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
