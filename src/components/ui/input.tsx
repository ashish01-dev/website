import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, style, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-[var(--c-muted)] focus:border-[var(--c-blue)] disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        style={{
          borderColor: 'var(--c-border-input)',
          color: 'var(--c-text)',
          background: 'var(--c-input)',
          ...style,
        }}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
