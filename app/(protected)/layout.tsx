import { ProtectedLayout } from '@/components/layouts/auth/protected-layout'
import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
