'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    // pour éviter le "flash" lors de l'hydratation
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-slate-400"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined')

  const nextTheme = theme === 'light' ? 'dark' : 'light'

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-slate-400"
      onClick={() => setTheme(nextTheme)}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
