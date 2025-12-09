// src/components/fasts/fast-preset-selector.tsx
'use client'

import { FASTING_PRESETS } from '@/constants/fasting-presets'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

type Props = {
  value: string
  onChange: (id: string) => void
  disabled?: boolean
}

export function FastPresetSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="fastPreset" className="text-xs text-slate-200">
        Type de jeûne
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="fastPreset" className="h-8 text-xs text-slate-200">
          <SelectValue placeholder="Choisis un protocole" />
        </SelectTrigger>
        <SelectContent className="text-xs">
          {FASTING_PRESETS.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {disabled && (
        <p className="text-[11px] text-slate-500">
          Tu as un jeûne en cours. Termine-le avant de changer de type.
        </p>
      )}
    </div>
  )
}
