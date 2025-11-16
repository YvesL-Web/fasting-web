'use client'

import { AuthContextValue, AuthState } from '@/types/auth'
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

const STORAGE_KEY = 'fasting_auth'

const INITIAL_AUTH: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  //   const [state, setState] = useState<AuthState>({
  //     user: null,
  //     accessToken: null,
  //     refreshToken: null
  //   })

  const [state, setState] = useState<AuthState>(() => {
    if (typeof window === 'undefined') return INITIAL_AUTH
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_AUTH
    try {
      return JSON.parse(raw) as AuthState
    } catch {
      return INITIAL_AUTH
    }
  })

  //   useEffect(() => {
  //     if (typeof window === 'undefined') return
  //     const raw = window.localStorage.getItem(STORAGE_KEY)
  //     if (!raw) return
  //     try {
  //       const parsed = JSON.parse(raw) as AuthState
  //       setState(parsed)
  //     } catch {
  //       // ignore
  //     }
  //   }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  //   const setAuth = (newState: AuthState) => setState(newState)
  //   const clearAuth = () =>
  //     setState({
  //       user: null,
  //       accessToken: null,
  //       refreshToken: null
  //     })

  const setAuth = useCallback((newState: AuthState) => setState(newState), [])
  const clearAuth = useCallback(() => setState(INITIAL_AUTH), [])
  const contextValue = useMemo(
    () => ({
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      setAuth,
      clearAuth
    }),
    [state, setAuth, clearAuth]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
