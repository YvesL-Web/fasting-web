'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  requestPasswordResetFormSchema,
  type RequestPasswordResetFormValues
} from '../../schemas/auth.schemas'
import { requestPasswordReset } from '@/lib/auth-client'
import { getUserFriendlyMessage } from '@/lib/errors'

export function useRequestPasswordResetForm() {
  const [devToken, setDevToken] = useState<string | null>(null)

  const form = useForm<RequestPasswordResetFormValues>({
    resolver: zodResolver(requestPasswordResetFormSchema),
    defaultValues: {
      email: ''
    }
  })

  const mutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (data) => {
      toast.success('Si un compte existe pour cet email, un lien a été envoyé.', {
        description: 'Vérifie ta boîte mail.'
      })

      // en dev: le backend peut renvoyer resetToken
      if (data.resetToken) {
        setDevToken(data.resetToken)
      }
    },
    onError: (error) => {
      const friendly = getUserFriendlyMessage(error)
      // le backend ne révèle pas si l'email existe, donc on reste vague
      toast.error('Impossible d’envoyer le lien.', {
        description: friendly
      })
    }
  })

  const onSubmit = form.handleSubmit((values) => {
    setDevToken(null)
    mutation.mutate(values)
  })

  return {
    form,
    onSubmit,
    isSubmitting: mutation.isPending,
    devToken
  }
}
