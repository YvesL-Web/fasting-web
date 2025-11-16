'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'

import { login } from '@/lib/auth-client'
import { isApiError, getUserFriendlyMessage, getFieldError } from '@/lib/errors'
import { useAuth } from '@/components/auth-provider'
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schemas'

export function useLoginForm() {
  const { setAuth } = useAuth()
  const router = useRouter()
  const [generalError, setGeneralError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || null
      })
      router.push('/dashboard')
    },
    onError: (error) => {
      // reset des erreurs de champ côté form
      form.clearErrors()
      setGeneralError(null)

      if (isApiError(error)) {
        // Erreurs de validation backend
        if (error.code === 'INVALID_INPUT' && error.details) {
          const emailError = getFieldError(error.details, 'email')
          const passwordError = getFieldError(error.details, 'password')

          if (emailError) {
            form.setError('email', { type: 'server', message: emailError })
          }
          if (passwordError) {
            form.setError('password', { type: 'server', message: passwordError })
          }

          // on met aussi un message global si tu veux
          if (!emailError && !passwordError) {
            setGeneralError(getUserFriendlyMessage(error))
          }
        } else {
          // Erreurs métier : INVALID_CREDENTIALS, UNAUTHORIZED, etc.
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
