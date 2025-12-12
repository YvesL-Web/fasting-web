// app/(protected)/settings/page.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShieldCheck, Smartphone, Monitor, Globe2, Crown } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/components/auth-provider'
import { useUploadAvatar } from '@/hooks/user/use-upload-avatar'
import { useUpdateProfile } from '@/hooks/user/use-update-profile'

import { cn } from '@/lib/utils'
import { SessionInfo } from '@/types/auth'
import { useChangePassword } from '@/hooks/user/use-security'
import { useLogoutAllSessions, useRevokeSession, useSessions } from '@/hooks/session/use-sessions'
import { isApiError, parseDetails } from '@/lib/errors'
import {
  ChangePasswordForm,
  changePasswordSchema,
  ProfileForm,
  profileSchema
} from '@/schemas/auth.schemas'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// ---------- Helpers ----------

function sessionDeviceLabel(session: SessionInfo) {
  const ua = (session.userAgent ?? '').toLowerCase()
  if (!ua) return 'Appareil inconnu'
  if (ua.includes('iphone') || ua.includes('android')) return 'Mobile'
  if (ua.includes('macintosh') || ua.includes('windows') || ua.includes('linux')) return 'Desktop'
  return 'Appareil'
}

function formatRelativeDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  if (diffHours < 1) return "Il y a moins d'une heure"
  if (diffHours < 24) return `Il y a ~${Math.round(diffHours)}h`
  const diffDays = Math.round(diffHours / 24)
  return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
}

// ---------- Page ----------

export default function SettingsPage() {
  const { user, refreshUser, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') ?? 'profile'

  const uploadAvatarMutation = useUploadAvatar()
  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()

  const { data: sessionsData, isLoading: isLoadingSessions } = useSessions()
  const sessions = sessionsData?.sessions ?? []

  const revokeSessionMutation = useRevokeSession()
  const revokeAllSessionsMutation = useLogoutAllSessions()

  // --- Avatar handlers ---
  const isUploading = uploadAvatarMutation.isPending

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName ?? '',
      locale: user?.locale ?? 'fr'
    }
  })

  useEffect(() => {
    if (user) {
      profileForm.reset({
        displayName: user.displayName,
        locale: user.locale
      })
    }
  }, [user, profileForm])

  // --- Change password form ---
  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  })

  const handleProfileSubmit = async (values: ProfileForm) => {
    try {
      await updateProfileMutation.mutateAsync(values)
      await refreshUser()
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

  const handlePasswordSubmit = async (values: ChangePasswordForm) => {
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

  const handleAvatarChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Fichier invalide', {
        description: 'Merci de choisir une image.'
      })
      e.target.value = ''
      return
    }

    try {
      await uploadAvatarMutation.mutateAsync(file)
      toast.success('Avatar mis à jour')
    } catch (err) {
      if (isApiError(err)) {
        toast.error('Erreur', {
          description: err.message
        })
      } else {
        toast.error('Erreur', {
          description: 'Impossible de mettre à jour ton avatar.'
        })
      }
    } finally {
      e.target.value = ''
    }
  }

  if (isLoading && !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    )
  }

  const initialLetter = user?.displayName?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-400">Paramètres</p>
          <h1 className="text-lg font-semibold text-slate-50">Ton espace personnel</h1>
          <p className="text-xs text-slate-400">
            Gère ton profil, ta sécurité et ton expérience dans l&apos;app.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">Plan actuel</span>
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-300">
            <Crown className="h-3 w-3 text-amber-400" />
            {user?.subscriptionPlan ?? 'FREE'}
          </span>
        </div>
      </section>

      {/* Tabs */}
      <Tabs defaultValue={initialTab} className="space-y-4">
        <TabsList className="w-full justify-start gap-2 bg-slate-900/60 p-1">
          <TabsTrigger value="profile" className="text-xs">
            Profil
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs">
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs">
            Apparence
          </TabsTrigger>
          <TabsTrigger value="subscription" className="text-xs">
            Abonnement
          </TabsTrigger>
        </TabsList>

        {/* PROFIL */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            {/* Picture */}
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader>
                <CardTitle className="text-xl font-medium text-slate-100">Picture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-6 md:flex-row">
                  {/* Avatar */}
                  <div className="flex flex-col items-center gap-3 ">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        {user?.avatarUrl && (
                          <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                        )}
                        <AvatarFallback>{initialLetter}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-slate-50">{user?.displayName}</p>
                        <p className="text-xs text-slate-400">{user?.email}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Plan : {user?.subscriptionPlan}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-center">
                      <Button size="default" variant="outline" disabled={isUploading} asChild>
                        <label className="cursor-pointer">
                          {isUploading ? 'Upload...' : 'Changer d’avatar'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </Button>
                      <p className="text-xs text-slate-500">
                        PNG/JPG, max ~5MB. Un avatar clair aide à te reconnaître partout.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form profil */}
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-medium text-slate-100">
                  Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="">
                  <form
                    className="space-y-4"
                    onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                    noValidate
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="displayName" className="text-xs text-slate-200">
                        Nom affiché
                      </Label>
                      <Input
                        id="displayName"
                        className="h-8 text-xs text-slate-200"
                        {...profileForm.register('displayName')}
                      />
                      {profileForm.formState.errors.displayName && (
                        <p className="text-[11px] text-red-400">
                          {profileForm.formState.errors.displayName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-200">Langue principale</Label>
                      <select
                        className="h-8 w-full rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100"
                        {...profileForm.register('locale')}
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>

                    <Separator className="bg-slate-800" />

                    <div className="flex justify-end">
                      <Button type="submit" size="sm" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SÉCURITÉ */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
            {/* Changement mot de passe */}
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-100">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Mot de passe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-3"
                  onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                  noValidate
                >
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-200">Mot de passe actuel</Label>
                    <Input
                      type="password"
                      className="h-8 text-xs text-slate-200"
                      {...passwordForm.register('currentPassword')}
                    />
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="text-[11px] text-red-400">
                        {passwordForm.formState.errors.currentPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-200">Nouveau mot de passe</Label>
                    <Input
                      type="password"
                      className="h-8 text-xs text-slate-200"
                      {...passwordForm.register('newPassword')}
                    />
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-[11px] text-red-400">
                        {passwordForm.formState.errors.newPassword.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-200">
                      Confirmation du nouveau mot de passe
                    </Label>
                    <Input
                      type="password"
                      className="h-8 text-xs text-slate-200"
                      {...passwordForm.register('confirmNewPassword')}
                    />
                    {passwordForm.formState.errors.confirmNewPassword && (
                      <p className="text-[11px] text-red-400">
                        {passwordForm.formState.errors.confirmNewPassword.message}
                      </p>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Après changement, tu pourras être déconnecté sur certains appareils pour des
                    raisons de sécurité.
                  </p>

                  <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={changePasswordMutation.isPending}>
                      {changePasswordMutation.isPending
                        ? 'Mise à jour...'
                        : 'Mettre à jour le mot de passe'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Sessions actives */}
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-100">
                  Sessions actives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-[11px] text-slate-500">
                  Gère les appareils connectés à ton compte. Tu peux révoquer une session spécifique
                  ou tout déconnecter.
                </p>

                {isLoadingSessions ? (
                  <p className="text-xs text-slate-400">Chargement des sessions...</p>
                ) : !sessions || sessions.length === 0 ? (
                  <p className="text-xs text-slate-400">Aucune autre session active détectée.</p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => {
                      const isCurrent = session.isCurrent ?? false
                      const deviceLabel = sessionDeviceLabel(session)
                      const ip = session.ip ?? 'IP inconnue'

                      const Icon = deviceLabel === 'Mobile' ? Smartphone : Monitor

                      return (
                        <div
                          key={session.id}
                          className={cn(
                            'flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2',
                            isCurrent && 'border-emerald-500/50'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900">
                              <Icon className="h-4 w-4 text-slate-300" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-medium text-slate-100">
                                {deviceLabel}
                                {isCurrent && (
                                  <span className="ml-2 text-[10px] text-emerald-400">
                                    (Cet appareil)
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {session.userAgent?.slice(0, 60) ?? 'User agent inconnu'}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                IP : {ip} • Créée {formatRelativeDate(session.createdAt)}
                              </p>
                            </div>
                          </div>
                          {!isCurrent && (
                            <Button
                              size="default"
                              variant="outline"
                              className="text-[11px]"
                              disabled={revokeSessionMutation.isPending}
                              onClick={() =>
                                revokeSessionMutation.mutate({
                                  id: session.id,
                                  isCurrent: session.isCurrent
                                })
                              }
                            >
                              Révoquer
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {sessions && sessions.length > 0 && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/40 text-xs text-red-300 hover:bg-red-500/10"
                      disabled={revokeAllSessionsMutation.isPending}
                      onClick={() =>
                        revokeAllSessionsMutation.mutate(undefined, {
                          onSuccess: () => {
                            toast.success('Toutes les sessions ont été révoquées')
                          },
                          onError: (error) => {
                            toast.error('Erreur', {
                              description:
                                error?.message ??
                                "Impossible de révoquer toutes les sessions pour l'instant."
                            })
                          }
                        })
                      }
                    >
                      Se déconnecter de tous les appareils
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* APPARENCE */}
        <TabsContent value="appearance" className="space-y-4">
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-100">
                <Globe2 className="h-4 w-4 text-emerald-400" />
                Apparence & thème
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-300">
              <p>
                Le thème clair/sombre est contrôlé via le bouton de bascule en haut à droite de
                l&apos;application.
              </p>
              <p className="text-slate-400">
                Plus tard, tu pourras personnaliser davantage ton expérience : couleurs
                d&apos;accent, fond dynamique, thèmes saisonniers, etc.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABONNEMENT */}
        <TabsContent value="subscription" className="space-y-4">
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-100">
                <Crown className="h-4 w-4 text-amber-400" />
                Abonnement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-300">
              <p>
                Plan actuel :{' '}
                <Badge variant="outline" className="border-amber-500/40 text-[11px] text-amber-300">
                  {user?.subscriptionPlan ?? 'FREE'}
                </Badge>
              </p>
              <p className="text-slate-400">
                Les fonctionnalités Premium incluront : plans de repas IA avancés, scanner calories
                via photo, statistiques approfondies et communauté exclusive.
              </p>
              <p className="text-slate-500">
                L&apos;intégration des paiements (Stripe / App Stores) sera branchée plus tard. Pour
                l&apos;instant, tu peux continuer à utiliser la version alpha librement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
