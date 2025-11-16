// features/auth/hooks/use-register-form.ts
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'

import { useAuth } from '@/components/auth-provider'
import { register as registerRequest } from '@/lib/auth-client'
import { isApiError, getUserFriendlyMessage, getFieldError } from '@/lib/errors'
import { registerSchema, type RegisterFormValues } from '@/schemas/auth.schemas'

export function useRegisterForm() {
  const { setAuth } = useAuth()
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
    onSuccess: (data) => {
      // on alimente l’AuthProvider avec la réponse backend
      setAuth({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || null
      })

      router.push('/dashboard')
    },
    onError: (error) => {
      form.clearErrors()
      setGeneralError(null)

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
            setGeneralError(getUserFriendlyMessage(error))
          }
        } else {
          // EMAIL_TAKEN, SERVER_ERROR, etc.
          setGeneralError(getUserFriendlyMessage(error))
        }
      } else {
        setGeneralError(getUserFriendlyMessage(error))
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
