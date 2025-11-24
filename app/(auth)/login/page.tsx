'use client'

import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useLoginForm } from '@/hooks/auth/use-login-form'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LoginInput, loginSchema } from '@/schemas/auth.schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogin } from '@/hooks/auth/use-auth'
import { toast } from 'sonner'
import { isApiError } from '@/lib/errors'
import { AuthPageShell } from '@/components/layouts/auth-page-shell'
import Link from 'next/link'

export default function LoginPage() {
  const { setUser } = useAuth()
  const router = useRouter()
  const { mutateAsync, isPending } = useLogin()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (values: LoginInput) => {
    setError(null)
    try {
      const res = await mutateAsync(values)
      setUser(res.user)
      toast.success('Bienvenue 👋', {
        description: `Content de te revoir, ${res.user?.displayName}`
      })
      router.push('/dashboard')
    } catch (error) {
      if (isApiError(error)) {
        if (error.code === 'INVALID_CREDENTIALS') {
          setError('Email ou mot de passe incorrect.')
          toast.error('Erreur de connexion', {
            description: error.message ?? 'Email ou mot de passe incorrect.'
          })
        } else if (error.code === 'FORBIDEN') {
          toast.error('Erreur de connexion', {
            description:
              error.message ?? "Email non vérifié. Vérifie ta boîte mail pour le code d'activation."
          })
        } else {
          setError(error.message)
        }
      } else {
        setError('Une erreur est survenue.')
      }
    }
  }

  return (
    <AuthPageShell
      title="Se connecter"
      subtitle="Reprends là où tu t’es arrêté. Suis tes jeûnes et reste focus."
      bottomText={
        <>
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-sky-400 hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
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
            autoComplete="current-password"
            {...form.register('password')}
            className="bg-slate-900/60 border-slate-700 text-slate-50"
          />
          {form.formState.errors.password && (
            <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
          )}
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-sky-400 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Connexion...' : 'Log in'}
        </Button>
      </form>
    </AuthPageShell>
  )
}
