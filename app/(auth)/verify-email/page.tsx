'use client'

import { useSearchParams, useRouter } from 'next/navigation'
// import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useVerifyEmail } from '@/hooks/auth/use-auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { VerifyEmailInput, verifyEmailSchema } from '@/schemas/auth.schemas'
import { toast } from 'sonner'
import { isApiError } from '@/lib/errors'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const initialEmail = searchParams.get('email') ?? ''

  const [error, setError] = useState<string | null>(null)
  const { mutateAsync, isPending } = useVerifyEmail()

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
      await mutateAsync(values)
      toast.success('Email verified', { description: 'Your email has been successfully verified.' })
      router.push('/login')
    } catch (error) {
      if (isApiError(error)) {
        setError(error.message)
        toast.error('Email verification failed', { description: error.message })
      } else {
        setError('An unexpected error occurred.')
        toast.error('Email verification failed', { description: 'An unexpected error occurred.' })
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

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Vérification...' : 'Vérifier'}
            </Button>

            <p className="text-xs text-slate-500 mt-2">
              Si tu n&apos;as rien reçu, vérifie ton dossier spam ou réessaie de t&apos;inscrire.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )

  // let content = null

  // if (isPending) {
  //   content = (
  //     <div className="flex items-center gap-2 text-slate-600">
  //       <Loader2 className="h-4 w-4 animate-spin" />
  //       <span>Vérification de ton email...</span>
  //     </div>
  //   )
  // } else if (isSuccess) {
  //   content = (
  //     <div className="flex flex-col items-center gap-2 text-slate-700">
  //       <CheckCircle2 className="h-8 w-8 text-green-500" />
  //       <p>Ton email a bien été vérifié 🎉</p>
  //       <a href="/dashboard" className="text-blue-600 underline text-sm">
  //         Aller au dashboard
  //       </a>
  //     </div>
  //   )
  // } else if (isError || !token) {
  //   content = (
  //     <div className="flex flex-col items-center gap-2 text-slate-700">
  //       <XCircle className="h-8 w-8 text-red-500" />
  //       <p>Ce lien de vérification est invalide ou expiré.</p>
  //       <a href="/login" className="text-blue-600 underline text-sm">
  //         Retour à la connexion
  //       </a>
  //     </div>
  //   )
  // }

  // return (
  //   <div className="min-h-screen flex items-center justify-center bg-slate-100">
  //     <Card className="w-full max-w-md">
  //       <CardHeader>
  //         <CardTitle className="text-xl">Vérification de l&apos;email</CardTitle>
  //       </CardHeader>
  //       <CardContent>{content}</CardContent>
  //     </Card>
  //   </div>
  // )
}
