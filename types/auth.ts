export type User = {
  id: string
  email: string
  displayName: string
  locale: 'en' | 'fr' | 'de'
  role: string
  subscriptionPlan: string
  createdAt: string
  updatedAt: string
}

export type AuthState = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
}

export type AuthContextValue = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (state: AuthState) => void
  clearAuth: () => void
}

export type RefreshResponse = {
  accessToken: string
  refreshToken: string
}
export type LoginResponse = AuthState
export type LoginSuccessPayload = AuthState
