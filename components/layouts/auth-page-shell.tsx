'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

type AuthPageShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
  bottomText?: ReactNode
}

export function AuthPageShell({ title, subtitle, children, bottomText }: AuthPageShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50">
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center text-xs font-bold">
            F
          </div>
          <span className="font-semibold tracking-tight">Fasting App</span>
        </Link>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Track your fasts. Stay consistent.
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-slate-800 bg-slate-900/70 backdrop-blur">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-slate-50">{title}</CardTitle>
              {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
            </CardHeader>
            <CardContent>
              {children}
              {bottomText && (
                <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-center text-slate-400">
                  {bottomText}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
