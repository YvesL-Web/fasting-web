'use client'

import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useRegisterForm } from '@/hooks/auth/use-register-form'

export default function RegisterPage() {
  const { form, onSubmit, isSubmitting, generalError } = useRegisterForm()

  const {
    register,
    formState: { errors }
  } = form

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Créer un compte</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="displayName">Nom</Label>
              <Input id="displayName" {...register('displayName')} />
              {errors.displayName && (
                <p className="text-sm text-red-500">{errors.displayName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="locale">Langue</Label>
              <select
                id="locale"
                className="border rounded px-2 py-1 w-full bg-white"
                {...register('locale')}
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
              {errors.locale && <p className="text-sm text-red-500">{errors.locale.message}</p>}
            </div>

            {generalError && <p className="text-sm text-red-500">{generalError}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Création du compte...' : 'Créer un compte'}
            </Button>

            <p className="text-sm text-center mt-2">
              Déjà un compte ?{' '}
              <a href="/login" className="text-blue-600 underline">
                Se connecter
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
