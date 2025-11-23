'use client'

import { useUploadAvatar } from '@/hooks/user/use-upload-avatar'
import { isApiError } from '@/lib/errors'
import { toast } from 'sonner'

export function AvatarUploader() {
  const { mutateAsync, isPending } = useUploadAvatar()

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await mutateAsync(file)
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
      // reset input pour pouvoir re-sélectionner le même fichier si besoin
      e.target.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input type="file" accept="image/*" onChange={handleChange} disabled={isPending} />
      {isPending && <span className="text-xs text-slate-500">Upload...</span>}
    </div>
  )
}
