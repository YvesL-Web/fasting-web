import Link from 'next/link'
import { Dumbbell, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
}

export function SiteHeader({ className }: Props) {
  return (
    <header
      className={cn(
        'border-b border-slate-800 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60',
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo + name */}
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            <Flame className="h-4 w-4" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-50">Fasting Coach</span>
            <span className="text-[11px] text-slate-400">Jeûne, nutrition, énergie</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-4 text-xs font-medium text-slate-300">
          <Link
            href="/#features"
            className="hidden text-slate-300 transition hover:text-slate-50 sm:inline-block"
          >
            Fonctionnalités
          </Link>
          <Link
            href="/pricing"
            className="hidden text-slate-300 transition hover:text-slate-50 sm:inline-block"
          >
            Tarifs
          </Link>
          <Link
            href="/#how-it-works"
            className="hidden text-slate-300 transition hover:text-slate-50 sm:inline-block"
          >
            Comment ça marche
          </Link>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden text-xs text-slate-200 hover:bg-slate-800/80 sm:inline-flex"
            >
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="text-xs font-semibold shadow-emerald-500/20 shadow-md"
            >
              <Link href="/register">
                <Dumbbell className="mr-1.5 h-3.5 w-3.5" />
                Commencer
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
