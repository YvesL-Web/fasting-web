'use client'

import { useRef } from 'react'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFoodScan } from '@/hooks/food/use-food-scan'
import type { FoodScanSuggestion } from '@/types/food-scanner'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Props = {
  disabled?: boolean
  onSuggestionClick?: (s: FoodScanSuggestion) => void
}

export function FoodScanButton({ disabled, onSuggestionClick }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { isScanning, lastResult, scan } = useFoodScan()

  const handleClick = () => {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await scan(file, { autoCreateItems: true })

      if (!result.suggestions.length) {
        toast.info('Aucun aliment détecté', {
          description: "L'IA n'a pas réussi à identifier clairement les aliments."
        })
        return
      }

      toast.success('Analyse terminée', {
        description: 'Clique sur un aliment proposé pour pré-remplir le formulaire.'
      })
    } catch (err) {
      toast.error('Erreur', {
        description: "Impossible d'analyser cette image pour le moment."
      })
    } finally {
      // reset pour permettre de re-sélectionner le même fichier
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full justify-center gap-2 text-xs"
        disabled={disabled || isScanning}
        onClick={handleClick}
      >
        <Camera className={cn('h-4 w-4', isScanning && 'animate-pulse')} />
        {isScanning ? 'Analyse en cours...' : 'Scanner un repas (IA)'}
      </Button>

      {lastResult && lastResult.suggestions.length > 0 && (
        <div className="rounded-md border border-slate-800 bg-slate-950/70 p-2">
          <p className="mb-1 text-[11px] font-semibold text-slate-200">
            Suggestions IA (clique pour remplir) :
          </p>
          <ul className="space-y-1">
            {lastResult.suggestions.map((s, idx) => (
              <li
                key={`${s.label}-${idx}`}
                className={cn(
                  'cursor-pointer rounded px-2 py-1 text-[11px] hover:bg-slate-900/80',
                  s.confidence >= 0.7 ? 'text-emerald-200' : 'text-slate-200'
                )}
                onClick={() => onSuggestionClick?.(s)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{s.label}</span>
                  <span className="text-[10px] text-slate-400">
                    {(s.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {s.calories != null && <span>{s.calories} kcal</span>}
                  {s.proteinGrams != null && <span> • Prot {s.proteinGrams} g</span>}
                  {s.carbsGrams != null && <span> • Gluc {s.carbsGrams} g</span>}
                  {s.fatGrams != null && <span> • Lip {s.fatGrams} g</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
