'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useMemo } from 'react'
import { LayoutDashboard, Utensils, Settings as SettingsIcon, Brain } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'
import { Separator } from '@/components/ui/separator'

type Props = {
  children: ReactNode
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    href: '/recipes',
    label: 'Recettes',
    icon: Utensils
  },
  {
    href: '/coach',
    label: 'Coach IA',
    icon: Brain
  },
  {
    href: '/settings',
    label: 'Paramètres',
    icon: SettingsIcon
  }
]

export function AppShell({ children }: Props) {
  const pathname = usePathname()

  const activeItem = useMemo(
    () => navItems.find((item) => pathname.startsWith(item.href)),
    [pathname]
  )

  const breadcrumbs = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean) // ex: ["dashboard"], ["recipes", "123"]
    const segments: { href: string; label: string }[] = []

    let acc = ''
    for (const part of parts) {
      acc += '/' + part
      let label = part

      if (part === 'dashboard') label = 'Dashboard'
      else if (part === 'recipes') label = 'Recettes'
      else if (part === 'settings') label = 'Paramètres'
      else if (part === 'coach') label = 'Coach IA'
      else if (part === 'profile') label = 'Profil'

      segments.push({ href: acc, label })
    }

    return segments
  }, [pathname])

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      {/* Sidebar */}
      <aside className="hidden w-60 border-r border-slate-800 bg-slate-950/80 px-4 py-4 md:flex md:flex-col">
        {/* logo + app name */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40">
            <span className="text-xs font-bold">F</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-100">Fasting App</span>
            <span className="text-[11px] text-slate-500">Fasting • Food • AI Coach</span>
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 space-y-1 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + '/') ||
              (item.href === '/dashboard' && pathname === '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-50'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* bottom area: soon badges, version, etc. */}
        <div className="mt-6 border-t border-slate-800 pt-3 text-[11px] text-slate-500">
          <p>Premium beta</p>
          <p className="text-[10px] text-slate-600">v0.1.0</p>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-3 py-2 backdrop-blur md:px-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-100">
                {activeItem?.label ?? 'Fasting App'}
              </p>
            </div>
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1 text-[11px] text-slate-500">
                {breadcrumbs.map((bc, index) => {
                  const isLast = index === breadcrumbs.length - 1
                  return (
                    <span key={bc.href} className="flex items-center gap-1">
                      {index > 0 && <span className="text-slate-600">/</span>}
                      {isLast ? (
                        <span className="font-medium text-slate-300">{bc.label}</span>
                      ) : (
                        <Link href={bc.href} className="hover:text-slate-300 hover:underline">
                          {bc.label}
                        </Link>
                      )}
                    </span>
                  )
                })}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Separator orientation="vertical" className="h-6 bg-slate-800" />
            <UserMenu />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 bg-slate-950/95 px-3 py-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
