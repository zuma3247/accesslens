import { useEffect, useState } from 'react';

interface HeatmapSkeletonProps {
  className?: string;
}

export function HeatmapSkeleton({ className = '' }: HeatmapSkeletonProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Create 4x4 grid of placeholder cells
  const rows = ['Perceivable', 'Operable', 'Understandable', 'Robust'];
  const cols = ['Critical', 'Serious', 'Moderate', 'Minor'];

  return (
    <div className={`${className}`}>
      {/* Table structure matching IssueHeatmap */}
      <table className="w-full border-collapse">
        <caption className="sr-only">Issue heatmap loading</caption>
        <thead>
          <tr>
            <th scope="col" className="sr-only">Principle</th>
            {cols.map((col) => (
              <th
                key={col}
                scope="col"
                className="text-xs font-medium uppercase tracking-[0.08em] text-[hsl(var(--color-text-secondary))] pb-2 text-center"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              <th
                scope="row"
                className="text-xs font-medium uppercase tracking-[0.08em] text-[hsl(var(--color-text-secondary))] pr-3 text-right"
              >
                {row}
              </th>
              {cols.map((col) => (
                <td key={`${row}-${col}`} className="p-1">
                  <div
                    className={`w-12 h-10 rounded-md bg-[hsl(var(--color-border))] ${
                      !prefersReducedMotion ? 'skeleton-shimmer' : ''
                    }`}
                    role="gridcell"
                    aria-label={`${row} ${col} loading`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
