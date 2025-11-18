'use client'

import { AuthProvider } from '@/components/auth-provider'
import { QueryProgressBar } from '@/components/query-progress-bar'
import { Toaster } from '@/components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

type Props = {
  children: ReactNode
}

export function AppProviders({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <QueryProgressBar />
        {children}
        <Toaster richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  )
}
