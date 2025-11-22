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

import { useResetPassword } from '@/hooks/auth/use-auth'
import { resetPasswordFormSchema, ResetPasswordFormValues } from '@/schemas/auth.schemas'
import { toast } from 'sonner'
import { isApiError } from '@/lib/errors'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialEmail = searchParams.get('email') ?? ''

  const [error, setError] = useState<string | null>(null)
  const { mutateAsync, isPending } = useResetPassword()

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
      await mutateAsync({
        email: values.email,
        code: values.code,
        newPassword: values.newPassword
      })

      toast.success('Mot de passe mis à jour', {
        description: 'Tu peux maintenant te connecter avec ton nouveau mot de passe.'
      })
      router.push('/login')
    } catch (error) {
      console.log(error)
      if (isApiError(error)) {
        setError(error.message)
        toast.error('change password failed', { description: error.message })
      } else {
        setError('An unexpected error occurred.')
        toast.error('change password failed', {
          description: 'An unexpected error occurred.'
        })
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

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </Button>

            <p className="text-sm text-center mt-2">
              <Link href="/login" className="text-blue-600 underline">
                Retour à la connexion
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
