import { POKEMON_TYPES, TYPE_COLORS } from '@/lib/typeColors'
import { cn } from '@/lib/utils'

export function TypeFilterPills({
  onClear,
  onToggle,
  selectedTypes
}: {
  onClear: () => void
  onToggle: (type: string) => void
  selectedTypes: string[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {POKEMON_TYPES.map(type => {
        const isSelected = selectedTypes.includes(type)
        return (
          <button
            aria-pressed={isSelected}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              isSelected
                ? cn(TYPE_COLORS[type], 'text-white')
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
            )}
            key={type}
            onClick={() => onToggle(type)}
            type="button"
          >
            {type}
          </button>
        )
      })}

      {selectedTypes.length > 0 && (
        <button
          className="text-muted-foreground hover:text-foreground px-2 py-1 text-xs font-medium underline underline-offset-2"
          onClick={onClear}
          type="button"
        >
          Clear
        </button>
      )}
    </div>
  )
}
