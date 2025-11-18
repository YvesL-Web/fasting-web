// app/(auth)/verify-email/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useVerifyEmail } from '@/hooks/auth/use-verify-email'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { isPending, isSuccess, isError } = useVerifyEmail(token)

  let content = null

  if (isPending) {
    content = (
      <div className="flex items-center gap-2 text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Vérification de ton email...</span>
      </div>
    )
  } else if (isSuccess) {
    content = (
      <div className="flex flex-col items-center gap-2 text-slate-700">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
        <p>Ton email a bien été vérifié 🎉</p>
        <a href="/dashboard" className="text-blue-600 underline text-sm">
          Aller au dashboard
        </a>
      </div>
    )
  } else if (isError || !token) {
    content = (
      <div className="flex flex-col items-center gap-2 text-slate-700">
        <XCircle className="h-8 w-8 text-red-500" />
        <p>Ce lien de vérification est invalide ou expiré.</p>
        <a href="/login" className="text-blue-600 underline text-sm">
          Retour à la connexion
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Vérification de l&apos;email</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    </div>
  )
}
