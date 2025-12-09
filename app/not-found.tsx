import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'
import { AlertTriangle } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-50">Page introuvable</h1>
        <p className="mt-2 text-sm text-slate-400">
          Oups, cette page n&apos;existe pas (ou plus). Tu peux retourner au dashboard ou à la page
          d&apos;accueil.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="sm">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="border-slate-700">
            <Link href="/dashboard">Aller au dashboard</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
