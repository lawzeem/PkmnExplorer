import * as React from 'react'

import { cn } from '@/lib/utils'

function Badge({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap text-white',
        className
      )}
      data-slot="badge"
      {...props}
    />
  )
}

export { Badge }
