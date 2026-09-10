import * as React from 'react'

import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-4 rounded-xl border py-4 shadow-sm',
        className
      )}
      data-slot="card"
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-4', className)}
      data-slot="card-content"
      {...props}
    />
  )
}

export { Card, CardContent }
