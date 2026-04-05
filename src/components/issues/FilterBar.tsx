import type { IssueSeverity, WcagPrinciple, SortMode, ConfidenceLevel } from '@/types/audit.types';

interface FilterBarProps {
  severityFilter: IssueSeverity | null;
  principleFilter: WcagPrinciple | null;
  confidenceFilter: ConfidenceLevel | null;
  sortMode: SortMode;
  onSeverityChange: (severity: IssueSeverity | null) => void;
  onPrincipleChange: (principle: WcagPrinciple | null) => void;
  onConfidenceChange: (confidence: ConfidenceLevel | null) => void;
  onSortChange: (mode: SortMode) => void;
  filteredCount: number;
  totalCount: number;
}

const severities: { value: IssueSeverity | null; label: string }[] = [
  { value: null, label: 'All Severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'serious', label: 'Serious' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'minor', label: 'Minor' },
];

const principles: { value: WcagPrinciple | null; label: string }[] = [
  { value: null, label: 'All Principles' },
  { value: 'perceivable', label: 'Perceivable' },
  { value: 'operable', label: 'Operable' },
  { value: 'understandable', label: 'Understandable' },
  { value: 'robust', label: 'Robust' },
];

const confidenceLevels: { value: ConfidenceLevel | null; label: string }[] = [
  { value: null, label: 'All Confidence' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'likely', label: 'Likely' },
  { value: 'review', label: 'Needs Review' },
];

const sortLabels: Record<SortMode, string> = {
  severity: 'Severity ↓',
  criterion: 'Criterion #',
  count: 'Count ↓',
};

const sortCycle: SortMode[] = ['severity', 'criterion', 'count'];

export function FilterBar({
  severityFilter,
  principleFilter,
  confidenceFilter,
  sortMode,
  onSeverityChange,
  onPrincipleChange,
  onConfidenceChange,
  onSortChange,
  filteredCount,
  totalCount,
}: FilterBarProps) {
  const handleSortClick = () => {
    const currentIndex = sortCycle.indexOf(sortMode);
    const nextIndex = (currentIndex + 1) % sortCycle.length;
    onSortChange(sortCycle[nextIndex]);
  };

  const handleClearAll = () => {
    onSeverityChange(null);
    onPrincipleChange(null);
    onConfidenceChange(null);
    onSortChange('severity');
  };

  const hasActiveFilters = severityFilter !== null || principleFilter !== null || confidenceFilter !== null;

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-lg">
      {/* Severity Select */}
      <div className="flex items-center gap-2">
        <label htmlFor="severity-filter" className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
          Severity:
        </label>
        <select
          id="severity-filter"
          value={severityFilter ?? ''}
          onChange={(e) => onSeverityChange(e.target.value ? (e.target.value as IssueSeverity) : null)}
          className="px-2 py-1 text-sm bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--indigo-400))]"
        >
          {severities.map(({ value, label }) => (
            <option key={label} value={value ?? ''}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Principle Select */}
      <div className="flex items-center gap-2">
        <label htmlFor="principle-filter" className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
          Principle:
        </label>
        <select
          id="principle-filter"
          value={principleFilter ?? ''}
          onChange={(e) => onPrincipleChange(e.target.value ? (e.target.value as WcagPrinciple) : null)}
          className="px-2 py-1 text-sm bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--indigo-400))]"
        >
          {principles.map(({ value, label }) => (
            <option key={label} value={value ?? ''}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Confidence Select */}
      <div className="flex items-center gap-2">
        <label htmlFor="confidence-filter" className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
          Confidence:
        </label>
        <select
          id="confidence-filter"
          value={confidenceFilter ?? ''}
          onChange={(e) => onConfidenceChange(e.target.value ? (e.target.value as ConfidenceLevel) : null)}
          className="px-2 py-1 text-sm bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--indigo-400))]"
        >
          {confidenceLevels.map(({ value, label }) => (
            <option key={label} value={value ?? ''}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Toggle */}
      <button
        type="button"
        onClick={handleSortClick}
        className="px-3 py-1 text-sm font-medium text-[hsl(var(--color-text-secondary))] bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-md hover:bg-[hsl(var(--color-bg-surface))] transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--indigo-400))]"
      >
        {sortLabels[sortMode]}
      </button>

      {/* Live Count */}
      <div
        className="text-sm text-[hsl(var(--color-text-secondary))]"
        aria-live="polite"
      >
        Showing {filteredCount} of {totalCount} issues
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearAll}
          className="ml-auto text-sm text-[hsl(var(--indigo-600))] hover:text-[hsl(var(--indigo-700))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--indigo-400))] rounded-md px-2 py-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
