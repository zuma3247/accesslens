import { useMemo } from 'react';
import { scaleSequential } from 'd3-scale';
import { interpolateRgb } from 'd3-interpolate';
import type { HeatmapGrid, WcagPrinciple, IssueSeverity, HeatmapFilter } from '@/types/audit.types';
import { useTheme } from '@/hooks/useTheme';

interface IssueHeatmapProps {
  grid: HeatmapGrid;
  onCellClick: (filter: HeatmapFilter | null) => void;
  activeFilter: HeatmapFilter | null;
}

const principles: WcagPrinciple[] = ['perceivable', 'operable', 'understandable', 'robust'];
const severities: IssueSeverity[] = ['critical', 'serious', 'moderate', 'minor'];

const principleLabels: Record<WcagPrinciple, string> = {
  perceivable: 'Perceivable',
  operable: 'Operable',
  understandable: 'Understandable',
  robust: 'Robust',
};

const severityLabels: Record<IssueSeverity, string> = {
  critical: 'Critical',
  serious: 'Serious',
  moderate: 'Moderate',
  minor: 'Minor',
};

export function IssueHeatmap({ grid, onCellClick, activeFilter }: IssueHeatmapProps) {
  const { theme } = useTheme();

  // Find max count for color scale
  const maxCount = useMemo(() => {
    let max = 0;
    for (const row of grid) {
      for (const cell of row) {
        if (cell.count > max) max = cell.count;
      }
    }
    return Math.max(max, 1); // Prevent division by zero
  }, [grid]);

  // Create theme-aware color scale
  const colorScale = useMemo(() => {
    const lowColor = theme === 'dark' ? 'hsl(220, 14%, 22%)' : 'hsl(220, 13%, 91%)';
    const highColor = theme === 'dark' ? 'hsl(0, 60%, 38%)' : 'hsl(0, 72%, 45%)';
    return scaleSequential(interpolateRgb(lowColor, highColor))
      .domain([0, maxCount]);
  }, [maxCount, theme]);

  const getCellColor = (count: number) => {
    if (count === 0) return 'hsl(var(--color-bg-surface))';
    return colorScale(count);
  };

  const isCellActive = (principle: WcagPrinciple, severity: IssueSeverity) => {
    return activeFilter?.principle === principle && activeFilter?.severity === severity;
  };

  return (
    <div className="w-full">
      <table className="w-full border-collapse" role="grid">
        <caption className="sr-only">
          Issue severity heatmap by WCAG principle and severity level
        </caption>
        <thead>
          <tr>
            <th scope="col" className="sr-only">Principle</th>
            {severities.map(severity => (
              <th
                key={severity}
                scope="col"
                className="pb-2 text-xs font-medium text-[hsl(var(--color-text-secondary))] uppercase tracking-[0.08em] text-center"
              >
                {severityLabels[severity]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {principles.map((principle, rowIndex) => (
            <tr key={principle}>
              <th
                scope="row"
                className="pr-3 py-2 text-xs font-medium text-[hsl(var(--color-text-secondary))] uppercase tracking-[0.08em] text-left"
              >
                {principleLabels[principle]}
              </th>
              {severities.map((severity, colIndex) => {
                const cell = grid[rowIndex]?.[colIndex];
                const count = cell?.count ?? 0;
                const isActive = isCellActive(principle, severity);
                
                return (
                  <td
                    key={`${principle}-${severity}`}
                    role="gridcell"
                    onClick={() => {
                      if (isActive) {
                        onCellClick(null);
                      } else {
                        onCellClick({ principle, severity });
                      }
                    }}
                    className={`
                      p-2 text-center cursor-pointer transition-all duration-100
                      ${isActive ? 'ring-2 ring-[hsl(var(--indigo-600))] ring-offset-1' : ''}
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]
                    `}
                    style={{ backgroundColor: getCellColor(count) }}
                    tabIndex={0}
                    title={count > 0 && cell?.topViolationName ? `Top issue: ${cell.topViolationName} — ${count} affected elements` : undefined}
                    aria-label={`${principleLabels[principle]}, ${severityLabels[severity]}: ${count} issues${cell?.topViolationName ? `. Top violation: ${cell.topViolationName}` : ''}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (isActive) {
                          onCellClick(null);
                        } else {
                          onCellClick({ principle, severity });
                        }
                      }
                    }}
                  >
                    <span
                      className={`text-sm font-medium ${
                        count > 0 ? 'text-[hsl(var(--color-text-primary))]' : 'text-[hsl(var(--color-text-disabled))]'
                      }`}
                    >
                      {count > 0 ? count : '—'}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
