import { useState } from 'react'

import type { StatFilterConfig, StatRanges } from '@/lib/statFilters'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import {
  getDefaultStatRanges,
  isStatRangeActive,
  STAT_FILTER_CONFIG
} from '@/lib/statFilters'

export function StatFilterButton({
  onChange,
  statRanges
}: {
  onChange: (ranges: StatRanges) => void
  statRanges: StatRanges
}) {
  const [isOpen, setIsOpen] = useState(false)

  const activeCount = STAT_FILTER_CONFIG.filter(config =>
    isStatRangeActive(config, statRanges[config.field])
  ).length

  return (
    <>
      <button
        aria-label="Filter by stats"
        className="bg-primary text-primary-foreground fixed bottom-6 left-6 z-40 flex size-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M3 6h18M7 12h10M11 18h2" />
        </svg>
        {activeCount > 0 && (
          <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-xs font-semibold">
            {activeCount}
          </span>
        )}
      </button>

      <Dialog onOpenChange={setIsOpen} open={isOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter by stats</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5">
            {STAT_FILTER_CONFIG.map(config => {
              const range = statRanges[config.field]
              return (
                <div className="flex flex-col gap-2" key={config.field}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{config.label}</span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {formatStatValue(range[0], config)} –{' '}
                      {formatStatValue(range[1], config)}
                    </span>
                  </div>
                  <Slider
                    max={config.max}
                    min={config.min}
                    onValueChange={value =>
                      onChange({
                        ...statRanges,
                        [config.field]: value as [number, number]
                      })
                    }
                    step={config.step}
                    value={range}
                  />
                </div>
              )
            })}
          </div>

          {activeCount > 0 && (
            <button
              className="text-muted-foreground hover:text-foreground self-start text-xs font-medium underline underline-offset-2"
              onClick={() => onChange(getDefaultStatRanges())}
              type="button"
            >
              Reset filters
            </button>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function formatStatValue(value: number, config: StatFilterConfig) {
  const formatted = Number.isInteger(value) ? value : value.toFixed(1)
  return config.unit ? `${formatted}${config.unit}` : `${formatted}`
}
