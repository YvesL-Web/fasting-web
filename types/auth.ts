export type User = {
  id: string
  email: string
  displayName: string
  locale: 'en' | 'fr' | 'de'
  role: string
  subscriptionPlan: string
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export type AuthState = {
  user: User | null
}

export type AuthContextValue = {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

export type LoginResponse = AuthState
export type LoginSuccessPayload = AuthState

export type VerifyEmailInput = {
  email: string
  code: string
}

export type RequestPasswordResetInput = {
  email: string
}

export type SessionInfo = {
  id: string
  ip: string | null
  userAgent: string | null
  createdAt: string
  isCurrent: boolean
}
