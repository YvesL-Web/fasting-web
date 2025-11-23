'use client'

import { useSearchParams, useRouter } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useResendVerificationEmail, useVerifyEmail } from '@/hooks/auth/use-auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { VerifyEmailInput, verifyEmailSchema } from '@/schemas/auth.schemas'
import { toast } from 'sonner'
import { isApiError, parseDetails } from '@/lib/errors'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialEmail = searchParams.get('email') ?? ''

  const [error, setError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  const { mutateAsync: asyncVerify, isPending: isVerifying } = useVerifyEmail()
  const { mutateAsync: asyncResend, isPending: isResending } = useResendVerificationEmail()

  const form = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: initialEmail,
      code: ''
    }
  })

  const onSubmit = async (values: VerifyEmailInput) => {
    setError(null)
    try {
      await asyncVerify(values)
      toast.success('Email verified ✅', {
        description: 'Your email has been successfully verified.'
      })
      router.push('/login')
    } catch (error) {
      if (isApiError(error)) {
        const details = parseDetails(error)
        if (details?.otpReason === 'too_many_attempts') {
          setError('Trop de tentatives. Réessaie plus tard.')
        } else if (details?.otpReason === 'expired_or_missing') {
          setError('Code expiré. Tu peux en demander un nouveau.')
        } else if (details?.otpReason === 'invalid') {
          setError('Code invalide. Vérifie et réessaie.')
        } else {
          setError(error.message)
        }

        if (error.code === 'RATE_LIMITED' || details?.reason === 'TOO_MANY_VERIFICATION_RESENDS') {
          setRateLimited(true)
        }
      } else {
        setError('An unexpected error occurred.')
        toast.error('Email verification failed', { description: 'An unexpected error occurred.' })
      }
    }
  }

  const handleResend = async () => {
    setError(null)
    if (rateLimited) return

    const email = form.getValues('email')
    if (!email) {
      setError('Merci de renseigner un email valide')
      return
    }
    try {
      await asyncResend({ email })
      toast.success('Nouveau code envoyé 📩', {
        description: 'Si un compte existe et n’est pas vérifié, un nouveau code a été envoyé.'
      })
    } catch (error) {
      if (isApiError(error)) {
        const details = parseDetails(error)
        if (error.code === 'RATE_LIMITED' || details?.reason === 'TOO_MANY_VERIFICATION_RESENDS') {
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
          <CardTitle className="text-xl">Vérifie ton email</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Nous t&apos;avons envoyé un code à 6 chiffres par email.
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
              <Label htmlFor="code">Code reçu</Label>
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

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={isVerifying || isResending || rateLimited}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Vérification de ton email...</span>
                </>
              ) : (
                'Vérifier'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={isResending || isVerifying || rateLimited}
            >
              {isResending ? 'Envoi du code...' : 'Renvoyer le code'}
            </Button>

            <p className="text-xs text-slate-500 mt-2">
              Le code expire après quelques minutes. Si tu ne le reçois pas, vérifie tes spams.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
