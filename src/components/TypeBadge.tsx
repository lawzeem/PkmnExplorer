import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  Bug: 'bg-lime-500',
  Dark: 'bg-slate-800',
  Dragon: 'bg-indigo-700',
  Electric: 'bg-yellow-500',
  Fairy: 'bg-pink-300',
  Fighting: 'bg-red-700',
  Fire: 'bg-red-500',
  Flying: 'bg-indigo-400',
  Ghost: 'bg-purple-700',
  Grass: 'bg-green-500',
  Ground: 'bg-amber-600',
  Ice: 'bg-cyan-300',
  Normal: 'bg-slate-400',
  Poison: 'bg-purple-500',
  Psychic: 'bg-pink-500',
  Rock: 'bg-amber-700',
  Steel: 'bg-slate-500',
  Water: 'bg-blue-500'
}

export function TypeBadge({ type }: { type: string }) {
  return (
    <Badge className={cn(TYPE_COLORS[type] ?? 'bg-slate-400')}>{type}</Badge>
  )
}
