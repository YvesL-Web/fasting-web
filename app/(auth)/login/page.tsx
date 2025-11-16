'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useLoginForm } from '@/hooks/auth/use-login-form'

export default function LoginPage() {
  const { form, onSubmit, isSubmitting, generalError } = useLoginForm()

  const {
    register,
    formState: { errors }
  } = form

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Log in</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {generalError && <p className="text-sm text-red-500">{generalError}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion...' : 'Log in'}
            </Button>

            <p className="text-sm text-center mt-2">
              Pas encore de compte ?{' '}
              <a href="/register" className="text-blue-600 underline">
                Créer un compte
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
