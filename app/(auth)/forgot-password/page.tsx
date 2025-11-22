'use client'

import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useRequestPasswordReset } from '@/hooks/auth/use-auth'
import { useForm } from 'react-hook-form'
import {
  requestPasswordResetFormSchema,
  RequestPasswordResetFormValues
} from '@/schemas/auth.schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { isApiError } from '@/lib/errors'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const { mutateAsync, isPending } = useRequestPasswordReset()

  const form = useForm<RequestPasswordResetFormValues>({
    resolver: zodResolver(requestPasswordResetFormSchema),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (values: RequestPasswordResetFormValues) => {
    setError(null)
    try {
      await mutateAsync({ email: values.email })
      toast.success('Email sent', {
        description: 'Please check your email for password reset instructions.'
      })
      const params = new URLSearchParams({ email: values.email })
      router.push(`/reset-password?${params.toString()}`)
    } catch (error) {
      console.log(error)
      if (isApiError(error)) {
        setError(error.message)
        toast.error('Password reset request failed', { description: error.message })
      } else {
        setError('An unexpected error occurred.')
        toast.error('Password reset request failed', {
          description: 'An unexpected error occurred.'
        })
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Mot de passe oublié</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Envoi...' : 'Envoyer le code '}
            </Button>

            <p className="text-sm text-center mt-2">
              <a href="/login" className="text-blue-600 underline">
                Retour à la connexion
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
