'use client'

import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAuth } from '@/components/auth-provider'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUploadAvatar } from '@/hooks/user/use-upload-avatar'
import { useDeleteAvatar } from '@/hooks/user/use-delete-avatar'
import { useUpdateProfile } from '@/hooks/user/use-update-profile'
import { useChangePassword, useLogoutAllSessions } from '@/hooks/user/use-security'
import { toast } from 'sonner'
import { isApiError, parseDetails } from '@/lib/errors'
import { useSessions, useRevokeSession } from '@/hooks/session/use-sessions'
import { formatRelativeFromNow } from '@/lib/time'
import { ProfileForm, profileSchema } from '@/schemas/auth.schemas'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Au moins 8 caractères'),
    newPassword: z.string().min(8, 'Au moins 8 caractères'),
    confirmNewPassword: z.string().min(8, 'Au moins 8 caractères')
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmNewPassword']
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

export default function SettingsPage() {
  const { user } = useAuth()

  const uploadMutation = useUploadAvatar()
  const deleteMutation = useDeleteAvatar()
  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()
  const logoutAllMutation = useLogoutAllSessions()
  const revokeSessionMutation = useRevokeSession()
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    isError: isErrorSessions
  } = useSessions()

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // --- Change password form ---
  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  })

  // --- Profile form ---
  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName,
      locale: user?.locale
    }
  })

  if (!user) return null

  const initialLetter = user.displayName?.charAt(0)?.toUpperCase() || 'U'
  const sessions = sessionsData?.sessions ?? []

  // --- Avatar handlers ---
  const isUploading = uploadMutation.isPending
  const isDeleting = deleteMutation.isPending

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.success('Fichier invalide', {
        description: 'Merci de choisir une image.'
      })
      e.target.value = ''
      return
    }

    try {
      await uploadMutation.mutateAsync(file)
      toast('Avatar mis à jour ✅')
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur', {
          description: err.message
        })
      } else {
        toast('Erreur', {
          description: 'Impossible de mettre à jour ton avatar.'
        })
      }
    } finally {
      e.target.value = ''
    }
  }

  const handleDeleteAvatar = async () => {
    try {
      await deleteMutation.mutateAsync()
      toast.success('Avatar supprimé', {
        description: 'Ton avatar a été supprimé.'
      })
    } catch (err) {
      if (isApiError(err)) {
        toast('Erreur', {
          description: err.message
        })
      } else {
        toast('Erreur', {
          description: 'Impossible de supprimer ton avatar.'
        })
      }
    }
  }

  const onSubmitProfile = async (values: ProfileForm) => {
    try {
      await updateProfileMutation.mutateAsync(values)
      toast.success('Profil mis à jour ✅')
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur', {
          description: err.message
        })
      } else {
        toast.error('Erreur', {
          description: 'Impossible de mettre à jour le profil.'
        })
      }
    }
  }

  const onSubmitPassword = async (values: ChangePasswordForm) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      })
      toast('Mot de passe mis à jour', {
        description: 'Reconnecte-toi avec ton nouveau mot de passe.'
      })
      // logout & redirection seront gérés par le hook + ProtectedLayout
    } catch (err) {
      if (isApiError(err)) {
        const details = parseDetails(err)
        if (details?.reason === 'INVALID_CURRENT_PASSWORD') {
          toast.error('Mot de passe incorrect', {
            description: "L'ancien mot de passe est incorrect."
          })
        } else {
          toast.error('Erreur', {
            description: err.message
          })
        }
      } else {
        toast.error('Erreur', {
          description: 'Impossible de changer le mot de passe.'
        })
      }
    }
  }

  const handleLogoutAll = async () => {
    try {
      await logoutAllMutation.mutateAsync()
      toast('Déconnecté de tous les appareils', {
        description: 'Reconnecte-toi pour continuer.'
      })
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur', {
          description: err.message
        })
      } else {
        toast('Erreur', {
          description: 'Impossible de terminer la déconnexion.'
        })
      }
    }
  }

  const isUpdatingProfile = updateProfileMutation.isPending
  const isChangingPassword = changePasswordMutation.isPending
  const isLoggingOutAll = logoutAllMutation.isPending

  return (
    <>
      {/* header page */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Profil & paramètres</h1>
        <p className="text-sm text-slate-400">
          Gère ton profil, ta photo et la sécurité de ton compte.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Colonne gauche : profil rapide + avatar */}
        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-100">Profil utilisateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
                <AvatarFallback>{initialLetter}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-slate-50">{user.displayName}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
                <p className="mt-1 text-xs text-slate-500">Plan : {user.subscriptionPlan}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSelectFile}
                  disabled={isUploading || isDeleting}
                >
                  {isUploading ? 'Upload...' : 'Changer d’avatar'}
                </Button>
                {user.avatarUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleDeleteAvatar}
                    disabled={isDeleting || isUploading}
                  >
                    {isDeleting ? 'Suppression...' : 'Supprimer'}
                  </Button>
                )}
              </div>
              <p className="text-xs text-slate-500">
                PNG, JPG, max 2 Mo. L’image est recadrée automatiquement autour du visage.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </CardContent>
        </Card>

        {/* Colonne droite : formulaires profil + sécurité */}
        <div className="space-y-4">
          {/* Form profil */}
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-100">
                Informations du profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                noValidate
              >
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-slate-200">
                    Nom affiché
                  </Label>
                  <Input
                    id="displayName"
                    {...profileForm.register('displayName')}
                    className="bg-slate-900/60 border-slate-700 text-slate-50"
                  />
                  {profileForm.formState.errors.displayName && (
                    <p className="text-xs text-red-400">
                      {profileForm.formState.errors.displayName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locale" className="text-slate-200">
                    Langue
                  </Label>
                  <select
                    id="locale"
                    className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
                    {...profileForm.register('locale')}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                  </select>
                  {profileForm.formState.errors.locale && (
                    <p className="text-xs text-red-400">
                      {profileForm.formState.errors.locale.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? 'Mise à jour...' : 'Enregistrer les modifications'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Form sécurité */}
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-100">Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                className="space-y-4"
                onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                noValidate
              >
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-slate-200">
                    Mot de passe actuel
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    {...passwordForm.register('currentPassword')}
                    className="bg-slate-900/60 border-slate-700 text-slate-50"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-red-400">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-200">
                    Nouveau mot de passe
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    {...passwordForm.register('newPassword')}
                    className="bg-slate-900/60 border-slate-700 text-slate-50"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-red-400">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword" className="text-slate-200">
                    Confirmer le nouveau mot de passe
                  </Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    autoComplete="new-password"
                    {...passwordForm.register('confirmNewPassword')}
                    className="bg-slate-900/60 border-slate-700 text-slate-50"
                  />
                  {passwordForm.formState.errors.confirmNewPassword && (
                    <p className="text-xs text-red-400">
                      {passwordForm.formState.errors.confirmNewPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Changement...' : 'Changer le mot de passe'}
                </Button>
              </form>

              <div className="border-t border-slate-800 pt-4 mt-2">
                <p className="text-xs text-slate-400 mb-3">
                  Tu peux te déconnecter de tous les appareils. Utile si tu penses que ton compte a
                  pu être utilisé ailleurs.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogoutAll}
                  disabled={isLoggingOutAll}
                >
                  {isLoggingOutAll ? 'Déconnexion...' : 'Se déconnecter de tous les appareils'}
                </Button>
              </div>
              <div className="border-t border-slate-800 pt-4 mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                    Sessions actives
                  </p>
                  {isLoadingSessions && (
                    <span className="text-[11px] text-slate-500">Chargement...</span>
                  )}
                </div>

                {isErrorSessions ? (
                  <p className="text-xs text-red-400">
                    Impossible de charger les sessions actives.
                  </p>
                ) : sessions.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Aucune autre session active pour le moment.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {sessions.map((s) => {
                      const label = s.isCurrent ? 'Cet appareil' : 'Autre appareil'
                      const relative = formatRelativeFromNow(s.createdAt)
                      const ua = s.userAgent || 'Navigateur inconnu'
                      const ip = s.ip || 'IP inconnue'

                      const isRevoking =
                        revokeSessionMutation.isPending &&
                        revokeSessionMutation.variables?.id === s.id

                      return (
                        <li
                          key={s.id}
                          className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2"
                        >
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-100">
                              {label}{' '}
                              <span className="text-[11px] text-slate-400">• {relative}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{ua}</p>
                            <p className="text-[11px] text-slate-500">IP : {ip}</p>
                          </div>
                          <div className="ml-4">
                            <Button
                              variant={s.isCurrent ? 'outline' : 'destructive'}
                              size="sm"
                              disabled={isRevoking}
                              onClick={() =>
                                revokeSessionMutation.mutate({
                                  id: s.id,
                                  isCurrent: s.isCurrent
                                })
                              }
                            >
                              {isRevoking
                                ? 'Suppression...'
                                : s.isCurrent
                                ? 'Se déconnecter ici'
                                : 'Révoquer'}
                            </Button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
