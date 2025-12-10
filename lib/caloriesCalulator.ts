export type Goal = 'WEIGHT_LOSS' | 'MAINTENANCE' | 'MUSCLE_GAIN'

export function getDefaultCaloriesForGoal(goal: Goal): number {
  switch (goal) {
    case 'WEIGHT_LOSS':
      return 1800
    case 'MUSCLE_GAIN':
      return 2400
    case 'MAINTENANCE':
    default:
      return 2100
  }
}

export type Sex = 'male' | 'female'
export type ActivityLevel = 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE' | 'ATHLETE'

export function activityFactor(level: ActivityLevel): number {
  switch (level) {
    case 'SEDENTARY':
      return 1.2
    case 'LIGHT':
      return 1.375
    case 'MODERATE':
      return 1.55
    case 'ACTIVE':
      return 1.725
    case 'ATHLETE':
      return 1.9
    default:
      return 1.3
  }
}

/**
 * Mifflin-St Jeor approx
 */
export function estimateCaloriesFromProfile(params: {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  activity: ActivityLevel
  goal: Goal
}): { maintenance: number; target: number } {
  const { sex, age, heightCm, weightKg, activity, goal } = params

  const bmr =
    sex === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161

  const maintenance = bmr * activityFactor(activity)

  let target = maintenance
  if (goal === 'WEIGHT_LOSS') {
    target = maintenance * 0.8 // -20%
  } else if (goal === 'MUSCLE_GAIN') {
    target = maintenance * 1.1 // +10%
  }

  return {
    maintenance: Math.round(maintenance),
    target: Math.round(target)
  }
}
