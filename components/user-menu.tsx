'use client'

import { User } from '@/types/auth'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { LogOut, Settings, User2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function UserMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()

  if (!user) return null

  const initials =
    user.displayName
      ?.split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase() ||
    user.email[0]?.toUpperCase() ||
    '?'

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 text-sm font-normal">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName ?? 'User'} />
            <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden flex-col text-left leading-tight sm:flex">
            <span className="text-xs font-medium text-slate-100">{user.displayName}</span>
            <span className="text-[10px] text-slate-400">{user.email}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">
          Connecté en tant que
          <br />
          <span className="font-medium text-slate-100">{user.displayName}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/settings')} className="text-xs">
          <Settings className="mr-2 h-3.5 w-3.5" />
          Paramètres
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings?tab=profile')} className="text-xs">
          <User2 className="mr-2 h-3.5 w-3.5" />
          Mon profil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-xs text-red-500 focus:text-red-600"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
