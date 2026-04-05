import { cva, type VariantProps } from 'class-variance-authority';
import { CircleDot, TriangleAlert, Diamond, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IssueSeverity } from '@/types/audit.types';

const severityBadgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium uppercase tracking-[0.08em] rounded-sm',
  {
    variants: {
      severity: {
        critical: 'bg-[hsl(var(--severity-critical-bg))] text-[hsl(var(--severity-critical-text))] tracking-[0.08em]',
        serious: 'bg-[hsl(var(--severity-serious-bg))] text-[hsl(var(--severity-serious-text))] tracking-[0.08em]',
        moderate: 'bg-[hsl(var(--severity-moderate-bg))] text-[hsl(var(--severity-moderate-text))] tracking-[0.08em]',
        minor: 'bg-[hsl(var(--severity-minor-bg))] text-[hsl(var(--severity-minor-text))] tracking-[0.08em]',
      },
    },
    defaultVariants: {
      severity: 'minor',
    },
  }
);

const severityIcons: Record<IssueSeverity, typeof CircleDot> = {
  critical: CircleDot,
  serious: TriangleAlert,
  moderate: Diamond,
  minor: Circle,
};

interface SeverityBadgeProps extends VariantProps<typeof severityBadgeVariants> {
  severity: IssueSeverity;
  showLabel?: boolean;
}

export function SeverityBadge({ severity, showLabel = true }: SeverityBadgeProps) {
  const Icon = severityIcons[severity];
  
  return (
    <span className={cn(severityBadgeVariants({ severity }))}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      {showLabel && <span>{severity}</span>}
    </span>
  );
}
