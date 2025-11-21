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
import { toast } from 'sonner'

export function useLoginForm() {
  const { setUser, refreshUser } = useAuth()
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
      setUser(data.user)
      toast.success('Bienvenue 👋', {
        description: `Content de te revoir, ${data.user?.displayName}`
      })
      router.push('/dashboard')
    },
    onError: (error) => {
      form.clearErrors()
      setGeneralError(null)

      const friendly = getUserFriendlyMessage(error)
      toast.error('Erreur de connexion', { description: friendly })

      if (isApiError(error)) {
        if (error.code === 'INVALID_INPUT' && error.details) {
          const emailError = getFieldError(error.details, 'email')
          const passwordError = getFieldError(error.details, 'password')
          if (emailError) {
            form.setError('email', { type: 'server', message: emailError })
          }
          if (passwordError) {
            form.setError('password', { type: 'server', message: passwordError })
          }

          if (!emailError && !passwordError) {
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
