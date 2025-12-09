import { SiteHeader } from '@/components/marketing/site-header'
import { SiteFooter } from '@/components/marketing/site-footer'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, Flame, Sparkles, Users, Utensils } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-10">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] md:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              <Sparkles className="h-3 w-3" />
              Fasting + nutrition + coach IA
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-4xl">
                Ton copilote pour le jeûne intermittent, les repas et l&apos;énergie au quotidien.
              </h1>
              <p className="max-w-xl text-sm text-slate-300">
                Suis tes fenêtres de jeûne, journalise ce que tu manges, reçois des analyses
                intelligentes et rejoint une communauté qui a les mêmes objectifs que toi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                className="text-sm font-semibold shadow-emerald-500/30 shadow-lg"
              >
                <Link href="/register">
                  Commencer gratuitement
                  <Flame className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-slate-700 text-sm text-slate-100"
              >
                <Link href="/pricing">Voir les offres Premium</Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Essai gratuit 14 jours</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Aucun engagement</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Mode sombre par défaut (évidemment 😎)</span>
              </div>
            </div>
          </div>

          {/* Hero side card : aperçu de l’app */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 p-4 shadow-2xl shadow-emerald-500/10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Jeûne en cours</p>
                <p className="text-lg font-semibold text-slate-50">16:8 Fasting</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300">
                +4 jours de streak
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-slate-300">Temps écoulé</span>
                <span className="font-mono text-emerald-300">12h 32m</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Fenêtre de jeûne</span>
                <span>Fenêtre d’alimentation</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="mb-1 text-[11px] text-slate-400">Aujourd&apos;hui</p>
                <p className="text-sm font-semibold text-slate-50">1 450 kcal</p>
                <p className="text-[11px] text-slate-400">
                  82% dans la fenêtre d&apos;alimentation 🍽️
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="mb-1 text-[11px] text-slate-400">Coach IA</p>
                <p className="text-[11px] text-slate-300">
                  &ldquo;Tu gères bien tes sorties de jeûne. Continue avec des repas riches en
                  protéines.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mt-16 space-y-6">
          <h2 className="text-lg font-semibold text-slate-50">
            Ce que tu peux faire avec l&apos;app
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              icon={<Clock className="h-4 w-4" />}
              title="Timer de jeûne intelligent"
              description="Planifie des jeûnes 16:8, 18:6, 20:4 ou personnalisés. Rappels et fenêtres d’alimentation claires."
            />
            <FeatureCard
              icon={<Utensils className="h-4 w-4" />}
              title="Journal alimentaire simple"
              description="Loggue ce que tu manges en quelques secondes. Distingue automatiquement les repas post-jeûne."
            />
            <FeatureCard
              icon={<Sparkles className="h-4 w-4" />}
              title="Coach IA (Premium)"
              description="Reçois des analyses personnalisées sur ton jeûne, tes calories et tes habitudes alimentaires."
              premium
            />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mt-16 space-y-6">
          <h2 className="text-lg font-semibold text-slate-50">Comment ça marche ?</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <StepCard
              step="1"
              title="Définis ton protocole"
              description="Choisis ton type de jeûne, ta langue, ton objectif principal (poids, énergie, santé...)."
            />
            <StepCard
              step="2"
              title="Suis jeûnes & repas"
              description="Laisse l’app suivre ta fenêtre de jeûne, ajoute tes repas et observe ton comportement post-jeûne."
            />
            <StepCard
              step="3"
              title="Laisse le coach t'aider"
              description="Analyse IA, recommandations simples, recettes adaptées. Progression semaine après semaine."
            />
          </div>
        </section>

        {/* Social proof / mini teaser communauté */}
        <section className="mt-16 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-50">
                  Bientôt : communauté & challenges
                </p>
                <p className="text-[11px] text-slate-400">
                  Challenges 30 jours, groupes premium, feed d’habitudes : tout pour rester motivé.
                </p>
              </div>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-sky-600/60 bg-sky-500/5 text-[11px] text-sky-100 hover:bg-sky-500/15"
            >
              <Link href="/register">Je veux être dans les premiers</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

type FeatureCardProps = {
  icon: React.ReactNode
  title: string
  description: string
  premium?: boolean
}

function FeatureCard({ icon, title, description, premium }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-emerald-300">
          {icon}
        </div>
        {premium && (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
            Premium
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  )
}

type StepCardProps = {
  step: string
  title: string
  description: string
}

function StepCard({ step, title, description }: StepCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
      <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-slate-200">
        {step}
      </div>
      <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  )
}
