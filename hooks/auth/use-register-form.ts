// features/auth/hooks/use-register-form.ts
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'

import { register as registerRequest } from '@/lib/auth-client'
import { isApiError, getUserFriendlyMessage, getFieldError } from '@/lib/errors'
import { registerSchema, type RegisterFormValues } from '@/schemas/auth.schemas'
import { toast } from 'sonner'

export function useRegisterForm() {
  const router = useRouter()
  const [generalError, setGeneralError] = useState<string | null>(null)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
      locale: 'en'
    }
  })

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: () => {
      toast.success('Compte créé 🎉', {
        description: 'Bienvenue ! Tu es maintenant connecté.'
      })

      const params = new URLSearchParams({ email: form.getValues('email') })
      router.push('/verify-email?' + params.toString())
    },
    onError: (error) => {
      form.clearErrors()
      setGeneralError(null)

      const friendly = getUserFriendlyMessage(error)
      toast.error('Erreur lors de l’inscription', { description: friendly })

      if (isApiError(error)) {
        if (error.code === 'INVALID_INPUT' && error.details) {
          const displayNameError = getFieldError(error.details, 'displayName')
          const emailError = getFieldError(error.details, 'email')
          const passwordError = getFieldError(error.details, 'password')
          const localeError = getFieldError(error.details, 'locale')

          if (displayNameError) {
            form.setError('displayName', { type: 'server', message: displayNameError })
          }
          if (emailError) {
            form.setError('email', { type: 'server', message: emailError })
          }
          if (passwordError) {
            form.setError('password', { type: 'server', message: passwordError })
          }
          if (localeError) {
            form.setError('locale', { type: 'server', message: localeError })
          }

          if (!displayNameError && !emailError && !passwordError && !localeError) {
            setGeneralError(friendly)
          }
        } else if (error.code === 'FORBIDDEN' && error.message) {
          const generalFieldError = getFieldError(error.message, 'general')
          if (generalFieldError) {
            setGeneralError(generalFieldError)
          } else {
            setGeneralError(friendly)
          }
        } else {
          setGeneralError(friendly)
        }
      } else {
        setGeneralError(friendly)
      }
    }
  })

  const onSubmit = form.handleSubmit((values) => {
    setGeneralError(null)
    mutation.mutate(values)
  })

  return {
    form,
    onSubmit,
    isSubmitting: mutation.isPending,
    generalError
  }
}
