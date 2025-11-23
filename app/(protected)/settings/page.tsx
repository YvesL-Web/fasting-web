'use client'

import { useAuth } from '@/components/auth-provider'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRef } from 'react'
import { useUploadAvatar } from '@/hooks/user/use-upload-avatar'
import { useDeleteAvatar } from '@/hooks/user/use-delete-avatar'
import { isApiError } from '@/lib/errors'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user } = useAuth()
  const uploadMutation = useUploadAvatar()
  const deleteMutation = useDeleteAvatar()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  if (!user) {
    // en théorie impossible car on est dans (protected), mais par sécurité :
    return null
  }

  const initialLetter = user.displayName?.charAt(0)?.toUpperCase() || 'U'

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
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
      await uploadMutation.mutateAsync(file)
      toast.success('Avatar mis à jour ✅')
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
        toast.error('Erreur', {
          description: err.message
        })
      } else {
        toast('Erreur', {
          description: 'Impossible de supprimer ton avatar.'
        })
      }
    }
  }

  const isUploading = uploadMutation.isPending
  const isDeleting = deleteMutation.isPending

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Mon profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar + actions */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
              <AvatarFallback>{initialLetter}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
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
                PNG, JPG, max 2 Mo. L’image est recadrée automatiquement.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Infos utilisateur simples */}
          <div className="space-y-2">
            <div>
              <p className="text-xs uppercase text-slate-500">Nom</p>
              <p className="text-sm font-medium">{user.displayName}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Email</p>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Langue</p>
              <p className="text-sm">{user.locale}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
