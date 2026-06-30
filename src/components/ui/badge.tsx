import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors',
  {
    variants: {
      variant: {
        default: '',
        pro: '',
        success: '',
        warning: '',
        premium: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, style, ...props }: BadgeProps) {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: { background: 'var(--c-tag)', color: 'var(--c-text-secondary)' },
    pro: { background: 'rgba(35,131,226,0.1)', color: 'var(--c-blue)' },
    success: { background: 'rgba(34,197,94,0.1)', color: '#22c55e' },
    warning: { background: 'rgba(234,179,8,0.1)', color: '#eab308' },
    premium: { background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.15))', color: '#818cf8' },
  }
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      style={{ ...variantStyles[variant || 'default'], ...style }}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
