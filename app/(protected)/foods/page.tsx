'use client'

import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { useRouter } from 'next/navigation'
import { PlusCircle, Trash2 } from 'lucide-react'

import { useUserFoods, useCreateFoodItem, useDeleteFoodItem } from '@/hooks/food/use-user-foods'
import { foodItemFormSchema } from '@/schemas/food.schemas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function FoodsPage() {
  return <FoodsPageInner />
}

function FoodsPageInner() {
  const router = useRouter()
  const { data, isLoading, isError } = useUserFoods()
  const createMutation = useCreateFoodItem()
  const deleteMutation = useDeleteFoodItem()

  const items = data?.items ?? []

  const form = useForm({
    resolver: zodResolver(foodItemFormSchema),
    defaultValues: {
      label: '',
      brand: '',
      servingSize: '',
      calories: undefined,
      proteinGrams: undefined,
      carbsGrams: undefined,
      fatGrams: undefined
    }
  })

  const onSubmit = async (values: z.infer<typeof foodItemFormSchema>) => {
    await createMutation.mutateAsync({
      label: values.label,
      brand: values.brand || undefined,
      servingSize: values.servingSize || undefined,
      calories: values.calories,
      proteinGrams: values.proteinGrams,
      carbsGrams: values.carbsGrams,
      fatGrams: values.fatGrams
    })

    form.reset({
      label: '',
      brand: '',
      servingSize: '',
      calories: undefined,
      proteinGrams: undefined,
      carbsGrams: undefined,
      fatGrams: undefined
    })
  }

  const handleDelete = async (id: string, label: string) => {
    const ok = window.confirm(`Supprimer l'aliment "${label}" ?`)
    if (!ok) return
    await deleteMutation.mutateAsync({ id })
  }

  const totalItems = useMemo(() => items.length, [items])

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-base font-semibold text-slate-50">Mes aliments</h1>
            <p className="text-xs text-slate-400">
              Crée ta propre base d&apos;aliments pour remplir ton journal plus rapidement.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => router.push('/nutrition')}
            >
              Retour à la nutrition
            </Button>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 lg:flex-row">
        {/* Liste des aliments */}
        <div className="flex-1">
          <Card className="h-full border-slate-800 bg-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium text-slate-100">
                Ta base d&apos;aliments
              </CardTitle>
              <span className="text-[11px] text-slate-400">
                {totalItems} aliment{totalItems > 1 ? 's' : ''}
              </span>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-xs text-slate-400">Chargement de tes aliments...</p>
              ) : isError ? (
                <p className="text-xs text-red-400">
                  Impossible de charger tes aliments pour le moment.
                </p>
              ) : items.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Tu n&apos;as pas encore ajouté d&apos;aliments personnalisés. Utilise le
                  formulaire à droite pour en créer un.
                </p>
              ) : (
                <ScrollArea className="max-h-[520px] pr-3">
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-col gap-1 rounded-md border border-slate-800 bg-slate-950/60 p-3 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <p className="font-medium text-slate-100">{item.label}</p>
                            {item.brand && (
                              <p className="text-[11px] text-slate-400">{item.brand}</p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'border-emerald-500/60 bg-emerald-500/10 text-[11px] text-emerald-300'
                            )}
                          >
                            Perso
                          </Badge>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 text-slate-500 hover:text-red-400"
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDelete(item.id, item.label)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                          {item.servingSize && <span>Portion : {item.servingSize}</span>}
                          {item.calories != null && <span>{item.calories} kcal</span>}
                          {item.proteinGrams != null && <span>Prot : {item.proteinGrams} g</span>}
                          {item.carbsGrams != null && <span>Glucides : {item.carbsGrams} g</span>}
                          {item.fatGrams != null && <span>Lipides : {item.fatGrams} g</span>}
                        </div>

                        <p className="text-[10px] text-slate-500">
                          Créé le{' '}
                          {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Formulaire de création */}
        <div className="w-full shrink-0 lg:w-80">
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium text-slate-100">Nouvel aliment</CardTitle>
              <PlusCircle className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="label" className="text-xs text-slate-200">
                    Nom *
                  </Label>
                  <Input
                    id="label"
                    className="text-xs text-slate-100"
                    placeholder="Ex : Poulet grillé, Pomme, Riz basmati..."
                    {...form.register('label')}
                  />
                  {form.formState.errors.label && (
                    <p className="text-[11px] text-red-400">
                      {form.formState.errors.label.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="brand" className="text-xs text-slate-200">
                    Marque (optionnel)
                  </Label>
                  <Input
                    id="brand"
                    className="text-xs text-slate-100"
                    placeholder="Ex : Marque, restaurant..."
                    {...form.register('brand')}
                  />
                  {form.formState.errors.brand && (
                    <p className="text-[11px] text-red-400">
                      {form.formState.errors.brand.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="servingSize" className="text-xs text-slate-200">
                    Portion (optionnel)
                  </Label>
                  <Input
                    id="servingSize"
                    className="text-xs text-slate-100"
                    placeholder="Ex : 100 g, 1 portion, 1 pièce..."
                    {...form.register('servingSize')}
                  />
                  {form.formState.errors.servingSize && (
                    <p className="text-[11px] text-red-400">
                      {form.formState.errors.servingSize.message as string}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="calories" className="text-xs text-slate-200">
                      Calories (kcal)
                    </Label>
                    <Input
                      id="calories"
                      type="number"
                      inputMode="numeric"
                      className="text-xs text-slate-100"
                      placeholder="Ex : 150"
                      {...form.register('calories')}
                    />
                    {form.formState.errors.calories && (
                      <p className="text-[11px] text-red-400">
                        {form.formState.errors.calories.message as string}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="proteinGrams" className="text-xs text-slate-200">
                      Protéines (g)
                    </Label>
                    <Input
                      id="proteinGrams"
                      type="number"
                      inputMode="numeric"
                      className="text-xs text-slate-100"
                      placeholder="Ex : 20"
                      {...form.register('proteinGrams')}
                    />
                    {form.formState.errors.proteinGrams && (
                      <p className="text-[11px] text-red-400">
                        {form.formState.errors.proteinGrams.message as string}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="carbsGrams" className="text-xs text-slate-200">
                      Glucides (g)
                    </Label>
                    <Input
                      id="carbsGrams"
                      type="number"
                      inputMode="numeric"
                      className="text-xs text-slate-100"
                      placeholder="Ex : 30"
                      {...form.register('carbsGrams')}
                    />
                    {form.formState.errors.carbsGrams && (
                      <p className="text-[11px] text-red-400">
                        {form.formState.errors.carbsGrams.message as string}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fatGrams" className="text-xs text-slate-200">
                      Lipides (g)
                    </Label>
                    <Input
                      id="fatGrams"
                      type="number"
                      inputMode="numeric"
                      className="text-xs text-slate-100"
                      placeholder="Ex : 10"
                      {...form.register('fatGrams')}
                    />
                    {form.formState.errors.fatGrams && (
                      <p className="text-[11px] text-red-400">
                        {form.formState.errors.fatGrams.message as string}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Création...' : 'Ajouter cet aliment'}
                  </Button>
                </div>

                <p className="pt-1 text-[11px] text-slate-500">
                  Ces aliments seront proposés en priorité dans la recherche du journal alimentaire.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
