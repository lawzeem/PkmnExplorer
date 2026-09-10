import { useState } from 'react'

import type { StatRanges } from '@/lib/statFilters'

import { PokemonCard } from '@/components/PokemonCard'
import { PokemonCardSkeleton } from '@/components/PokemonCardSkeleton'
import { StatFilterButton } from '@/components/StatFilterButton'
import { TypeFilterPills } from '@/components/TypeFilterPills'
import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useInfiniteScrollSentinel } from '@/hooks/useInfiniteScrollSentinel'
import { usePokemonList } from '@/hooks/usePokemonList'
import { getDefaultStatRanges } from '@/lib/statFilters'

const SKELETON_COUNT = 8
const SKELETON_KEYS = Array.from(
  { length: SKELETON_COUNT },
  (_, index) => `skeleton-${index}`
)

export default function PokemonGrid() {
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const toggleType = (type: string) => {
    setSelectedTypes(previous =>
      previous.includes(type)
        ? previous.filter(selected => selected !== type)
        : [...previous, type].sort()
    )
  }

  const [statRanges, setStatRanges] = useState<StatRanges>(() =>
    getDefaultStatRanges()
  )
  const debouncedStatRanges = useDebouncedValue(statRanges, 300)

  const { error, hasNext, isLoading, items, loadMore, retry } =
    usePokemonList(debouncedSearch, selectedTypes, debouncedStatRanges)

  const sentinelRef = useInfiniteScrollSentinel(
    loadMore,
    hasNext && !isLoading
  )

  const isInitialLoad = isLoading && items.length === 0

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <StatFilterButton onChange={setStatRanges} statRanges={statRanges} />

      <div className="flex flex-col gap-3">
        <Input
          onChange={event => setSearchInput(event.target.value)}
          placeholder="Search by name, type, or description..."
          type="text"
          value={searchInput}
        />
        <TypeFilterPills
          onClear={() => setSelectedTypes([])}
          onToggle={toggleType}
          selectedTypes={selectedTypes}
        />
      </div>

      {error && (
        <div className="border-destructive/50 text-destructive flex flex-col items-center gap-2 rounded-md border p-6 text-center text-sm">
          <p>{error}</p>
          <button
            className="border-input hover:bg-accent rounded-md border px-3 py-1.5 text-sm font-medium"
            onClick={retry}
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      {!error && !isInitialLoad && items.length === 0 && (
        <p className="text-muted-foreground py-12 text-center text-sm">
          {getEmptyMessage(debouncedSearch, selectedTypes)}
        </p>
      )}

      {!error && (items.length > 0 || isInitialLoad) && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {items.map(pokemon => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
          {isInitialLoad &&
            SKELETON_KEYS.map(key => <PokemonCardSkeleton key={key} />)}
        </div>
      )}

      {!error && !isInitialLoad && hasNext && (
        <div className="flex justify-center py-4" ref={sentinelRef}>
          {isLoading && (
            <span className="text-muted-foreground text-sm">
              Loading more...
            </span>
          )}
        </div>
      )}

      {!error && !isInitialLoad && !hasNext && items.length > 0 && (
        <p className="text-muted-foreground py-4 text-center text-sm">
          You've caught them all!
        </p>
      )}
    </div>
  )
}

function getEmptyMessage(search: string, types: string[]) {
  const typeList = types.length > 0 ? types.join(', ') : ''

  if (search && typeList) return `No Pokemon found for "${search}" in ${typeList}.`
  if (search) return `No Pokemon found for "${search}".`
  if (typeList) return `No Pokemon found in ${typeList}.`
  return 'No Pokemon found.'
}
