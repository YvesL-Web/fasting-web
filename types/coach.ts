export type CoachFeedback = {
  message: string
  tips: string[]
}

export type FastCoachInput = {
  fastId: string
  includeFoodSummary?: boolean
  locale?: 'en' | 'fr' | 'de'
}

export type FastCoachResponse = {
  feedback: CoachFeedback
}
