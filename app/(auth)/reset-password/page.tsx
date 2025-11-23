'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

import { useRequestPasswordReset, useResetPassword } from '@/hooks/auth/use-auth'
import { resetPasswordFormSchema, ResetPasswordFormValues } from '@/schemas/auth.schemas'
import { toast } from 'sonner'
import { isApiError, parseDetails } from '@/lib/errors'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialEmail = searchParams.get('email') ?? ''

  const [error, setError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)

  const { mutateAsync: asyncReset, isPending: isReseting } = useResetPassword()
  const { mutateAsync: asyncRequest, isPending: isRequesting } = useRequestPasswordReset()

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: initialEmail,
      code: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setError(null)
    try {
      await asyncReset({
        email: values.email,
        code: values.code,
        newPassword: values.newPassword
      })

      toast.success('Mot de passe mis à jour ✅', {
        description: 'Tu peux maintenant te connecter avec ton nouveau mot de passe.'
      })
      router.push('/login')
    } catch (error) {
      if (isApiError(error)) {
        const details = parseDetails(error)
        if (details?.otpReason === 'too_many_attempts') {
          setError('Trop de tentatives. Réessaie plus tard.')
          toast.error('Trop de tentatives. Réessaie plus tard.')
        } else if (details?.otpReason === 'expired_or_missing') {
          setError('Code expiré. Tu peux demander un nouveau code.')
          toast.error('Code expiré. Tu peux demander un nouveau code.')
        } else if (details?.otpReason === 'invalid') {
          setError('Code invalide. Vérifie et réessaie.')
          toast.error('Code invalide. Vérifie et réessaie.')
        } else {
          setError(error.message)
          toast.error('change password failed', { description: error.message })
        }
      } else {
        setError('An unexpected error occurred.')
        toast.error('change password failed', {
          description: 'An unexpected error occurred.'
        })
      }
    }
  }

  const handleResend = async () => {
    setError(null)
    if (rateLimited) return

    const email = form.getValues('email')
    if (!email) {
      setError('Merci de renseigner un email valide.')
      return
    }

    try {
      await asyncRequest({ email })
      toast.success('Nouveau code envoyé 📩', {
        description:
          'Si un compte existe avec cet email, un nouveau code de réinitialisation a été envoyé.'
      })
    } catch (error) {
      if (isApiError(error)) {
        const details = parseDetails(error)
        if (
          error.code === 'RATE_LIMITED' ||
          details?.reason === 'TOO_MANY_PASSWORD_RESET_RESENDS'
        ) {
          setError('Trop de demandes. Réessaie un peu plus tard.')
          setRateLimited(true)
        } else {
          setError(error.message)
        }
      } else {
        setError('Impossible de renvoyer le code.')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Réinitialiser ton mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Entre le code reçu par email et choisis un nouveau mot de passe.
          </p>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                {...form.register('code')}
              />
              {form.formState.errors.code && (
                <p className="text-sm text-red-500">{form.formState.errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input id="newPassword" type="password" {...form.register('newPassword')} />
              {form.formState.errors.newPassword && (
                <p className="text-sm text-red-500">{form.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirme le mot de passe</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                {...form.register('confirmNewPassword')}
              />
              {form.formState.errors.confirmNewPassword && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.confirmNewPassword.message}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={isReseting || isRequesting || rateLimited}
            >
              {isReseting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isReseting ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </Button>

            <p className="text-sm text-center mt-2">
              <Link href="/login" className="text-blue-600 underline">
                Retour à la connexion
              </Link>
            </p>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isRequesting || isReseting || rateLimited}
            >
              {isRequesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRequesting ? 'Envoi du code' : 'Renvoyer le code'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
