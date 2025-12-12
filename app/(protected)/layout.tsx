'use client'

import { AppShell } from '@/components/app-shell'
import { ProtectedLayout } from '@/components/layouts/protected-layout'
import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedLayout>
      <AppShell>{children}</AppShell>
    </ProtectedLayout>
  )
}
