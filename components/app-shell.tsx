'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { LogOut, LayoutDashboard, Settings, CircuitBoard } from 'lucide-react'

type AppShellProps = {
  children: ReactNode
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/nutrition', label: 'Nutrition', icon: CircuitBoard },
  { href: '/settings', label: 'Profil & compte', icon: Settings }
]

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  const initialLetter = user?.displayName?.charAt(0)?.toUpperCase() || 'U'

  const handleLogout = async () => {
    await logout()
    // la redirection vers /login sera gérée par ProtectedLayout
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-900 text-xs font-bold">
              F
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">Fasting App</span>
              <span className="text-[11px] text-slate-400">Jeûnes. Habitudes. Progression.</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-medium">{user.displayName}</span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                    {user.email}
                  </span>
                </div>
                <Avatar className="h-8 w-8">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
                  <AvatarFallback className="text-xs">{initialLetter}</AvatarFallback>
                </Avatar>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-50"
              onClick={handleLogout}
              aria-label="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main area: sidebar + content */}
      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden border-r border-slate-800 bg-slate-950/80 md:block md:w-56">
          <nav className="sticky top-14 flex flex-col gap-1 px-4 py-4 text-sm">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 transition-colors',
                    isActive
                      ? 'bg-slate-800 text-slate-50'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
