import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'good' | 'warn' | 'bad'
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-zinc-100 text-zinc-800',
    good: 'bg-emerald-100 text-emerald-900',
    warn: 'bg-amber-100 text-amber-900',
    bad: 'bg-red-100 text-red-900',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}

