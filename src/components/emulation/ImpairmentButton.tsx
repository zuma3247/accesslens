import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const impairmentButtonVariants = cva(
  'px-3 py-2 text-sm font-medium rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] focus-visible:ring-offset-2',
  {
    variants: {
      active: {
        true: 'bg-[hsl(var(--indigo-600))] text-[hsl(var(--slate-50))] border-[hsl(var(--indigo-600))]',
        false: 'bg-[hsl(var(--slate-100))] text-[hsl(var(--slate-900))] border-[hsl(var(--slate-300))] hover:bg-[hsl(var(--slate-200))]',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

interface ImpairmentButtonProps extends VariantProps<typeof impairmentButtonVariants> {
  label: string;
  onClick: () => void;
  ariaPressed: boolean;
}

export const ImpairmentButton = forwardRef<HTMLButtonElement, ImpairmentButtonProps>(
  function ImpairmentButton({ label, onClick, active, ariaPressed }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-pressed={ariaPressed}
        className={cn(impairmentButtonVariants({ active }))}
      >
        {label}
      </button>
    );
  }
);
