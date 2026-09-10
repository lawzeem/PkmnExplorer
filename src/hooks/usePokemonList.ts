import { useCallback, useEffect, useRef, useState } from 'react'

import type { StatRanges } from '@/lib/statFilters'
import type { Pokemon, PokemonPage } from '@/lib/types'

import { isStatRangeActive, STAT_FILTER_CONFIG } from '@/lib/statFilters'

const PAGE_SIZE = 24

export function usePokemonList(
  search: string,
  types: string[],
  statRanges: StatRanges
) {
  const [items, setItems] = useState<Pokemon[]>([])
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<null | string>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const pendingFetchRef = useRef<{ append: boolean; pageToFetch: number }>({
    append: false,
    pageToFetch: 1
  })

  const fetchPage = useCallback(
    async (pageToFetch: number, append: boolean) => {
      pendingFetchRef.current = { append, pageToFetch }

      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          page: String(pageToFetch)
        })
        if (search) params.set('search', search)
        if (types.length > 0) params.set('type', types.join(','))

        for (const config of STAT_FILTER_CONFIG) {
          const range = statRanges[config.field]
          if (!isStatRangeActive(config, range)) continue
          if (range[0] > config.min)
            params.set(`${config.field}Min`, String(range[0]))
          if (range[1] < config.max)
            params.set(`${config.field}Max`, String(range[1]))
        }

        const response = await fetch(`/api/pokemon?${params.toString()}`, {
          signal: controller.signal
        })
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)

        const body = (await response.json()) as PokemonPage
        setItems(previous =>
          append ? [...previous, ...body.data] : body.data
        )
        setHasNext(body.pagination.hasNext)
        setPage(pageToFetch)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Failed to load Pokemon')
      } finally {
        if (abortControllerRef.current === controller) setIsLoading(false)
      }
    },
    [search, types, statRanges]
  )

  useEffect(() => {
    void fetchPage(1, false)
    return () => abortControllerRef.current?.abort()
  }, [fetchPage])

  const loadMore = useCallback(() => {
    if (isLoading || !hasNext) return
    void fetchPage(page + 1, true)
  }, [fetchPage, hasNext, isLoading, page])

  const retry = useCallback(() => {
    const { append, pageToFetch } = pendingFetchRef.current
    void fetchPage(pageToFetch, append)
  }, [fetchPage])

  return { error, hasNext, isLoading, items, loadMore, retry }
}
