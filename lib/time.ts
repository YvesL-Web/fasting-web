export function formatRelativeFromNow(dateIso: string, locale: string = 'fr-FR'): string {
  const date = new Date(dateIso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  const seconds = Math.round(diffMs / 1000)
  const minutes = Math.round(seconds / 60)
  const hours = Math.round(minutes / 60)
  const days = Math.round(hours / 24)

  if (seconds < 60) return 'il y a quelques secondes'
  if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`
  return `il y a ${days} jour${days > 1 ? 's' : ''}`
}

export function formatDurationH(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(h)}:${pad(m)}`
}
