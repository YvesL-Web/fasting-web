'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { verifyEmail } from '@/lib/auth-client'
import { getUserFriendlyMessage } from '@/lib/errors'

export function useVerifyEmail(token: string | null) {
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: () => {
      if (!token) {
        throw new Error('Token de vérification manquant.')
      }
      return verifyEmail({ token })
    },
    onSuccess: () => {
      toast.success('Email vérifié ✅', {
        description: "Merci d'avoir confirmé ton adresse email."
      })
      // tu peux décider où rediriger (dashboard ou login)
      router.push('/dashboard')
    },
    onError: (error) => {
      toast.error("Impossible de vérifier l'email", {
        description: getUserFriendlyMessage(error)
      })
    }
  })

  useEffect(() => {
    if (!token) {
      toast.error('Lien invalide', {
        description: 'Ce lien de vérification est invalide ou incomplet.'
      })
      return
    }

    mutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return mutation
}
