import { useEffect, useRef } from 'react'

export function useInfiniteScrollSentinel(
  onIntersect: () => void,
  enabled: boolean
) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect()
      },
      { rootMargin: '400px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [enabled, onIntersect])

  return sentinelRef
}
