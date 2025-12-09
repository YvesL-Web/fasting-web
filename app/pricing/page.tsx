import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'
import { Button } from '@/components/ui/button'
import { Check, Crown, Flame } from 'lucide-react'
import Link from 'next/link'

const freeFeatures = [
  'Timer de jeûne (12:12, 14:10, 16:8, 18:6, 20:4, perso)',
  'Journal alimentaire simple',
  'Stats basiques (durée, streaks, calories/jour)',
  'Accès à quelques recettes et idées de repas',
  'Accès à la future communauté publique'
]

const premiumFeatures = [
  'Coach IA jeûne + nutrition',
  'Stats avancées & insights post-jeûne',
  'Catalogue de recettes + carnet perso',
  'Scanner IA (photo → estimation calories) [bientôt]',
  'Modules de meal prep & listes de courses [bientôt]',
  'Communauté premium + challenges exclusifs [bientôt]'
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <section className="text-center">
          <p className="text-xs uppercase tracking-wide text-emerald-300">Tarifs</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
            Free pour commencer. Premium quand tu es prêt.
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            Un plan simple : commence avec le timer de jeûne, puis débloque toute la puissance de
            l’IA et des stats quand tu veux aller plus loin.
          </p>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-[minmax(0,1fr),minmax(0,1.1fr)]">
          {/* Plan Free */}
          <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="text-left">
                <h2 className="text-sm font-semibold text-slate-50">Free</h2>
                <p className="text-xs text-slate-400">Pour démarrer le jeûne sans friction.</p>
              </div>
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                Plan actuel recommandé
              </span>
            </div>

            <div className="mb-4">
              <span className="text-2xl font-semibold text-slate-50">0€</span>
              <span className="ml-1 text-xs text-slate-400">/ mois</span>
            </div>

            <ul className="mb-5 space-y-2 text-xs text-slate-300">
              {freeFeatures.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="mt-0.5 h-3 w-3 flex-none text-emerald-400" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button asChild variant="outline" size="sm" className="mt-auto w-full border-slate-700">
              <Link href="/register">Commencer gratuitement</Link>
            </Button>
          </div>

          {/* Plans Premium */}
          <div className="space-y-4">
            {/* Monthly */}
            <div className="relative flex flex-col rounded-2xl border border-emerald-600/70 bg-gradient-to-br from-emerald-600/10 via-slate-950 to-slate-950/95 p-5 shadow-lg shadow-emerald-500/30">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="text-left">
                  <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                    <Crown className="h-3 w-3" />
                    Premium
                  </div>
                  <h2 className="text-sm font-semibold text-slate-50">Premium mensuel</h2>
                  <p className="text-xs text-slate-200">
                    Pour tester le mode “coach + stats avancées”.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                  Recommandé
                </span>
              </div>

              <div className="mb-4">
                <span className="text-2xl font-semibold text-slate-50">9,99€</span>
                <span className="ml-1 text-xs text-slate-300">/ mois</span>
                <p className="text-[11px] text-emerald-200">14 jours d’essai gratuit</p>
              </div>

              <ul className="mb-5 space-y-2 text-xs text-slate-100">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-3 w-3 flex-none text-emerald-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="sm"
                className="mt-auto w-full bg-emerald-500 text-xs font-semibold text-emerald-950 hover:bg-emerald-400"
              >
                {/* Pour l'instant, on redirige vers register/dashboard en attendant Stripe */}
                <Link href="/register">
                  Passer en Premium
                  <Flame className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
              <p className="mt-2 text-[10px] text-emerald-200/90">
                Paiement & gestion de l’abonnement seront gérés plus tard (Stripe / Paddle).
              </p>
            </div>

            {/* Yearly */}
            <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/90 p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="text-left">
                  <h2 className="text-sm font-semibold text-slate-50">Premium annuel</h2>
                  <p className="text-xs text-slate-300">
                    Pour ceux qui veulent installer une habitude sur la durée.
                  </p>
                </div>
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                  2 mois offerts
                </span>
              </div>

              <div className="mb-4">
                <span className="text-2xl font-semibold text-slate-50">59,99€</span>
                <span className="ml-1 text-xs text-slate-300">/ an</span>
                <p className="text-[11px] text-slate-400">
                  soit ~4,99€ / mois, facturé annuellement
                </p>
              </div>

              <ul className="mb-5 space-y-2 text-xs text-slate-200">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-3 w-3 flex-none text-emerald-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button asChild variant="outline" size="sm" className="mt-auto w-full">
                <Link href="/register">Choisir le plan annuel</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
