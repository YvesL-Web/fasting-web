'use client'

import { useIsFetching, useIsMutating } from '@tanstack/react-query'

export function QueryProgressBar() {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const active = isFetching + isMutating > 0

  return (
    <div
      className={`fixed top-0 left-0 right-0 h-0.5 z-50 transition-opacity ${
        active ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="h-full w-full animate-pulse bg-sky-500" />
    </div>
  )
}
