'use client'

import { apiFetch } from '@/lib/api'
import { ApiError } from '@/lib/errors'
import { AuthContextValue, User } from '@/types/auth'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo
} from 'react'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const setUser = useCallback((u: User | null) => {
    setUserState(u)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiFetch<{ user: User }>('auth/me')
      setUserState(res.user)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUserState(null)
      } else {
        setUserState(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const logout = useCallback(async () => {
    try {
      await apiFetch<void>('/auth/logout', { method: 'POST' })
    } catch (error) {
      // ignore erreurs logout
    } finally {
      setUserState(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      setUser,
      refreshUser,
      logout
    }),
    [user, isLoading, setUser, refreshUser, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
