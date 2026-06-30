import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-blue)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'text-white hover:opacity-90 active:scale-[0.97]',
        secondary: 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:scale-[0.97]',
        ghost: 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] active:scale-[0.97]',
        outline: 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] active:scale-[0.97]',
      },
      size: {
        sm: 'h-8 px-3 text-xs gap-1.5',
        md: 'h-10 px-4 gap-2',
        lg: 'h-12 px-6 text-[15px] gap-2.5',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={
          variant === 'primary'
            ? { background: 'var(--c-btn-primary)', ...style }
            : variant === 'outline'
              ? { border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)', ...style }
              : { color: 'var(--c-text)', ...style }
        }
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
