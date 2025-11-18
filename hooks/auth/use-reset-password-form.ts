'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { resetPasswordFormSchema, type ResetPasswordFormValues } from '../../schemas/auth.schemas'
import { resetPassword } from '@/lib/auth-client'
import { getUserFriendlyMessage } from '@/lib/errors'

export function useResetPasswordForm(token: string | null) {
  const router = useRouter()

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: ''
    }
  })

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordFormValues) => {
      if (!token) {
        throw new Error('Token de réinitialisation manquant.')
      }
      return resetPassword({ token, newPassword: values.newPassword })
    },
    onSuccess: () => {
      toast.success('Mot de passe mis à jour ✅', {
        description: 'Tu peux maintenant te connecter avec ton nouveau mot de passe.'
      })
      router.push('/login')
    },
    onError: (error) => {
      toast.error('Impossible de réinitialiser le mot de passe', {
        description: getUserFriendlyMessage(error)
      })
    }
  })

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values)
  })

  useEffect(() => {
    if (!token) {
      toast.error('Lien invalide', {
        description: 'Ce lien de réinitialisation est invalide ou incomplet.'
      })
    }
  }, [token])

  return {
    form,
    onSubmit,
    isSubmitting: mutation.isPending,
    hasToken: !!token
  }
}
