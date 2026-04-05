import type { LevelBreakdown as LevelBreakdownType } from '@/types/audit.types';

interface LevelBreakdownProps {
  breakdown: LevelBreakdownType;
}

export function LevelBreakdown({ breakdown }: LevelBreakdownProps) {
  const levels = [
    { key: 'A' as const, label: 'Level A' },
    { key: 'AA' as const, label: 'Level AA' },
    { key: 'AAA' as const, label: 'Level AAA' },
  ];

  return (
    <div className="space-y-3">
      {levels.map(({ key, label }) => {
        const data = breakdown[key];
        const percentage = data.total > 0 ? (data.passing / data.total) * 100 : 100;
        
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[hsl(var(--color-text-primary))]">
                {label}
              </span>
              <span className="text-[hsl(var(--color-text-secondary))]">
                {data.passing}/{data.total}
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-[hsl(var(--color-border))] rounded-full overflow-hidden">
              <div
                className="h-full bg-[hsl(var(--indigo-600))] rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
                aria-hidden="true"
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-[hsl(var(--color-text-secondary))]">
              <span>{data.passing} passing</span>
              <span>{data.failing} failing</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
