'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useRegister } from '@/hooks/auth/use-auth'
import { RegisterInput, registerSchema } from '@/schemas/auth.schemas'

import { isApiError } from '@/lib/errors'
import { AuthPageShell } from '@/components/layouts/auth-page-shell'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { mutateAsync, isPending } = useRegister()

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
      locale: 'en'
    }
  })

  const onSubmit = async (values: RegisterInput) => {
    setError(null)
    try {
      const res = await mutateAsync(values)

      toast.success('Account created', {
        description: res.message ?? 'Vérifie tes emails pour le code de vérification.'
      })
      const params = new URLSearchParams({ email: values.email })
      router.push(`/verify-email?${params.toString()}`)
    } catch (error) {
      if (isApiError(error)) {
        if (error.code === 'EMAIL_TAKEN') {
          setError(error.message ?? 'Cet email est déjà utilisé.')
          toast.error('Erreur lors de l’inscription', {
            description: error.message ?? 'Cet email est déjà utilisé.'
          })
        } else {
          toast.error('Erreur lors de l’inscription', { description: error.message })
        }
      } else {
        setError('Impossible de créer ton compte.')
      }
    }
  }

  return (
    <AuthPageShell
      title="Créer un compte"
      subtitle="Commence à suivre tes jeûnes, tes progrès et tes habitudes."
      bottomText={
        <>
          Déjà un compte ?{' '}
          <Link href="/login" className="text-sky-400 hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="displayName" className="text-slate-200">
            Nom
          </Label>
          <Input
            id="displayName"
            {...form.register('displayName')}
            className="bg-slate-900/60 border-slate-700 text-slate-50"
          />
          {form.formState.errors.displayName && (
            <p className="text-xs text-red-400">{form.formState.errors.displayName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-200">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register('email')}
            className="bg-slate-900/60 border-slate-700 text-slate-50"
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-200">
            Mot de passe
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...form.register('password')}
            className="bg-slate-900/60 border-slate-700 text-slate-50"
          />
          {form.formState.errors.password && (
            <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="locale" className="text-slate-200">
            Langue
          </Label>
          <select
            id="locale"
            className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
            {...form.register('locale')}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Création du compte...' : 'Créer un compte'}
        </Button>
      </form>
    </AuthPageShell>
  )
}
