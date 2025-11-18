'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { getUserFriendlyMessage } from '@/lib/errors'
import { useAuthedApi } from '@/hooks/auth/use-authed-api'

export function ResendEmailVerificationButton() {
  const { authedFetch } = useAuthedApi()

  const mutation = useMutation({
    mutationFn: () =>
      authedFetch<{ verificationToken?: string }>('/auth/request-email-verification', {
        method: 'POST',
        body: {}
      }),
    onSuccess: (data) => {
      toast.success('Email de vérification envoyé', {
        description: 'Vérifie ta boîte mail.'
      })

      if (data.verificationToken) {
        // en dev tu peux l'afficher dans la console
        // ou le montrer dans un toast séparé
        console.debug('Verification token (dev):', data.verificationToken)
      }
    },
    onError: (error) => {
      toast.error("Impossible d'envoyer l'email de vérification", {
        description: getUserFriendlyMessage(error)
      })
    }
  })

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Envoi...' : "Renvoyer l'email de vérification"}
    </Button>
  )
}
