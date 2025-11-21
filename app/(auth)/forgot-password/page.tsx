'use client'

import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useRequestPasswordResetForm } from '@/hooks/auth/use-request-password-reset'

export default function ForgotPasswordPage() {
  const { form, onSubmit, isSubmitting, devToken } = useRequestPasswordResetForm()

  const {
    register,
    formState: { errors }
  } = form

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Mot de passe oublié</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
            </Button>

            <p className="text-sm text-center mt-2">
              <a href="/login" className="text-blue-600 underline">
                Retour à la connexion
              </a>
            </p>

            {devToken && (
              <p className="mt-4 text-xs text-slate-500 break-all">
                <span className="font-semibold">Token (dev):</span> {devToken}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
