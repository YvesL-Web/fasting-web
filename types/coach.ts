export type CoachFeedback = {
  message: string
  tips: string[]
}

export type FastCoachInput = {
  fastId: string
  includeFoodSummary?: boolean
  locale?: 'en' | 'fr' | 'de'
}

export type FastCoachGoal = 'weight_loss' | 'energy' | 'health' | 'maintenance'

export type FastCoachFeedbackInput = {
  mood?: string
  notes?: string
  mainGoal?: FastCoachGoal
}

export type FastCoachFeedbackResponse = {
  message: string
}
