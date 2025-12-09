export type FastingPreset = {
  id: string
  label: string
  fastingHours: number
  eatingHours: number
}

export const FASTING_PRESETS: FastingPreset[] = [
  { id: '12_12', label: '12:12 - Standard ', fastingHours: 12, eatingHours: 12 },
  { id: '14_10', label: '14:10 - Avancé', fastingHours: 14, eatingHours: 10 },
  { id: '16_8', label: '16:8 - Agressif', fastingHours: 16, eatingHours: 8 },
  { id: '18_6', label: '18:6 - Plus agressif', fastingHours: 18, eatingHours: 6 },
  { id: '20_4', label: '20:4 - Warrior', fastingHours: 20, eatingHours: 4 },
  { id: 'OMAD', label: 'OMAD (23:1)', fastingHours: 23, eatingHours: 1 }
]
