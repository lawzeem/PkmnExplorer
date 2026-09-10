import { Badge } from '@/components/ui/badge'
import { TYPE_COLORS } from '@/lib/typeColors'
import { cn } from '@/lib/utils'

export function TypeBadge({ type }: { type: string }) {
  return (
    <Badge className={cn(TYPE_COLORS[type] ?? 'bg-slate-400')}>{type}</Badge>
  )
}
