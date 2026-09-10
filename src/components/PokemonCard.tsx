import { memo, useState } from 'react'

import type { Pokemon } from '@/lib/types'

import { TypeBadge } from '@/components/TypeBadge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type StatKey =
  | 'attack'
  | 'defense'
  | 'hp'
  | 'specialAttack'
  | 'specialDefense'
  | 'speed'

const STATS: { key: StatKey; label: string; max: number }[] = [
  { key: 'hp', label: 'HP', max: 255 },
  { key: 'attack', label: 'Attack', max: 190 },
  { key: 'defense', label: 'Defense', max: 230 },
  { key: 'specialAttack', label: 'Sp. Atk', max: 194 },
  { key: 'specialDefense', label: 'Sp. Def', max: 230 },
  { key: 'speed', label: 'Speed', max: 200 }
]

export const PokemonCard = memo(function PokemonCard({
  pokemon
}: {
  pokemon: Pokemon
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Card
        aria-haspopup="dialog"
        className="cursor-pointer transition-shadow hover:shadow-md"
        onClick={() => setIsOpen(true)}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setIsOpen(true)
          }
        }}
        role="button"
        tabIndex={0}
      >
        <CardContent className="flex flex-col gap-3">
          <img
            alt={pokemon.name}
            className="aspect-square w-full rounded-lg object-cover"
            loading="lazy"
            src={pokemon.imageUrl}
          />

          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-semibold">{pokemon.name}</h3>
            {pokemon.isLegendary && (
              <Badge className="bg-amber-400 text-amber-950">Legendary</Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {pokemon.types.map(type => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {pokemon.name}
              {pokemon.isLegendary && (
                <Badge className="bg-amber-400 text-amber-950">
                  Legendary
                </Badge>
              )}
            </DialogTitle>
            <div className="flex flex-wrap gap-1">
              {pokemon.types.map(type => (
                <TypeBadge key={type} type={type} />
              ))}
            </div>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <img
              alt={pokemon.name}
              className="aspect-square w-full rounded-lg object-cover"
              src={pokemon.imageUrl}
            />

            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground text-sm">
                {pokemon.description}
              </p>

              <dl className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Generation</dt>
                  <dd>{pokemon.generation}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Height</dt>
                  <dd>{pokemon.height.toFixed(1)} m</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Weight</dt>
                  <dd>{pokemon.weight.toFixed(1)} kg</dd>
                </div>
              </dl>

              <div className="flex flex-col gap-1.5">
                {STATS.map(stat => (
                  <div className="flex items-center gap-2" key={stat.key}>
                    <span className="text-muted-foreground w-16 shrink-0 text-xs">
                      {stat.label}
                    </span>
                    <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (pokemon[stat.key] / stat.max) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs tabular-nums">
                      {pokemon[stat.key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
})
