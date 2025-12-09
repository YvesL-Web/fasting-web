import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Fasting Coach. Tous droits réservés.</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/pricing" className="hover:text-slate-300">
            Tarifs
          </Link>
          <span className="h-3 w-px bg-slate-700" />
          <span className="text-slate-600">Fabriqué avec ❤️ pour le jeûne intermittent.</span>
        </div>
      </div>
    </footer>
  )
}
