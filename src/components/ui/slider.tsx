import * as SliderPrimitive from '@radix-ui/react-slider'
import * as React from 'react'

import { cn } from '@/lib/utils'

function Slider({
  className,
  defaultValue,
  max = 100,
  min = 0,
  value,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const values = React.useMemo(() => {
    if (Array.isArray(value)) return value
    if (Array.isArray(defaultValue)) return defaultValue
    return [min, max]
  }, [value, defaultValue, min, max])

  return (
    <SliderPrimitive.Root
      className={cn(
        'relative flex w-full touch-none items-center py-1 select-none data-[disabled]:opacity-50',
        className
      )}
      data-slot="slider"
      defaultValue={defaultValue}
      max={max}
      min={min}
      value={value}
      {...props}
    >
      <SliderPrimitive.Track
        className="bg-muted relative h-1.5 grow overflow-hidden rounded-full"
        data-slot="slider-track"
      >
        <SliderPrimitive.Range
          className="bg-primary absolute h-full"
          data-slot="slider-range"
        />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb
          className="border-primary bg-background block size-4 shrink-0 rounded-full border shadow transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          data-slot="slider-thumb"
          key={index === 0 ? 'thumb-start' : 'thumb-end'}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
