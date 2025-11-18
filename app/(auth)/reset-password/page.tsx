'use client'

import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

import { useResetPasswordForm } from '@/hooks/auth/use-reset-password-form'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { form, onSubmit, isSubmitting, hasToken } = useResetPasswordForm(token)

  const {
    register,
    formState: { errors }
  } = form

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Nouveau mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasToken ? (
            <p className="text-sm text-red-500">
              Lien invalide. Vérifie que tu as bien ouvert le lien complet.
            </p>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('newPassword')}
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-500">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register('confirmNewPassword')}
                />
                {errors.confirmNewPassword && (
                  <p className="text-sm text-red-500">{errors.confirmNewPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || !hasToken}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </Button>

              <p className="text-sm text-center mt-2">
                <a href="/login" className="text-blue-600 underline">
                  Retour à la connexion
                </a>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
