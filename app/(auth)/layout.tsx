'use client'

import { GuestLayout } from '@/components/layouts/guest-layout'
import type { ReactNode } from 'react'

export default function AuthSegmentLayout({ children }: { children: ReactNode }) {
  return <GuestLayout>{children}</GuestLayout>
}
