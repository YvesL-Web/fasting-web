// app/(protected)/settings/page.tsx
'use client'

import { useRef } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

import { useUploadAvatar } from '@/hooks/user/use-upload-avatar'
import { useDeleteAvatar } from '@/hooks/user/use-delete-avatar'
import { toast } from 'sonner'
import { isApiError } from '@/lib/errors'

export default function SettingsPage() {
  const { user } = useAuth()
  const uploadMutation = useUploadAvatar()
  const deleteMutation = useDeleteAvatar()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  if (!user) return null

  const initialLetter = user.displayName?.charAt(0)?.toUpperCase() || 'U'
  const isUploading = uploadMutation.isPending
  const isDeleting = deleteMutation.isPending

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast('Fichier invalide', {
        description: 'Merci de choisir une image.'
      })
      e.target.value = ''
      return
    }

    try {
      await uploadMutation.mutateAsync(file)
      toast.success('Avatar mis à jour ✅')
    } catch (err) {
      if (isApiError(err)) {
        toast('Erreur', {
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
      toast('Avatar supprimé', {
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

  return (
    <>
      {/* header page */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Profil & paramètres</h1>
        <p className="text-sm text-slate-400">Gère ton profil, ta photo et tes préférences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Colonne gauche : profil rapide */}
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

        {/* Colonne droite : autres réglages (placeholder pour l'instant) */}
        <div className="space-y-4">
          <Card className="border-slate-800 bg-slate-900/70">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-100">
                Informations du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase text-slate-500">Nom</p>
                <p className="text-slate-100">{user.displayName}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Email</p>
                <p className="text-slate-100">{user.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Langue</p>
                <p className="text-slate-100">{user.locale}</p>
              </div>
            </CardContent>
          </Card>

          {/* Tu pourras ajouter ici: changement mot de passe, langue, etc. */}
        </div>
      </div>
    </>
  )
}
