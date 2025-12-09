'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error('App error boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-50">Une erreur est survenue</h1>
        <p className="mt-2 text-sm text-slate-400">
          Désolé, quelque chose s&apos;est mal passé. Tu peux réessayer ou revenir à l&apos;accueil.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button size="sm" onClick={() => reset()}>
            Réessayer
          </Button>
          <Button asChild size="sm" variant="outline" className="border-slate-700">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
