import { useState, useMemo, useCallback } from 'react';
import type { Issue, IssueSeverity, WcagPrinciple, SortMode, HeatmapFilter } from '@/types/audit.types';
import { IssueCard } from './IssueCard';
import { FilterBar } from './FilterBar';

interface IssueCardListProps {
  issues: Issue[];
  heatmapFilter: HeatmapFilter | null;
  onClearHeatmapFilter: () => void;
  selectedIssue: Issue | null;
  onSelectIssue: (issue: Issue | null) => void;
  onOpenBeforeAfter: ((issue: Issue, triggerElement?: HTMLElement) => void) | undefined;
}

export function IssueCardList({
  issues,
  heatmapFilter,
  onClearHeatmapFilter,
  selectedIssue,
  onSelectIssue,
  onOpenBeforeAfter,
}: IssueCardListProps) {
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | null>(null);
  const [principleFilter, setPrincipleFilter] = useState<WcagPrinciple | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('severity');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);

  // Combine all filters
  const filteredIssues = useMemo(() => {
    let result = [...issues];

    // Apply heatmap filter
    if (heatmapFilter) {
      result = result.filter(
        issue =>
          issue.principle === heatmapFilter.principle &&
          issue.severity === heatmapFilter.severity
      );
    }

    // Apply severity filter
    if (severityFilter) {
      result = result.filter(issue => issue.severity === severityFilter);
    }

    // Apply principle filter
    if (principleFilter) {
      result = result.filter(issue => issue.principle === principleFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortMode) {
        case 'severity': {
          const severityOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        case 'criterion':
          return a.wcagCriterion.localeCompare(b.wcagCriterion);
        case 'count':
          return b.affectedCount - a.affectedCount;
        default:
          return 0;
      }
    });

    return result;
  }, [issues, heatmapFilter, severityFilter, principleFilter, sortMode]);

  const handleToggleExpand = useCallback((issue: Issue) => {
    setExpandedIssueId(prev => {
      const newId = prev === issue.id ? null : issue.id;
      // Also update selected issue
      onSelectIssue(newId === issue.id ? issue : null);
      return newId;
    });
  }, [onSelectIssue]);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <FilterBar
        severityFilter={severityFilter}
        principleFilter={principleFilter}
        sortMode={sortMode}
        onSeverityChange={setSeverityFilter}
        onPrincipleChange={setPrincipleFilter}
        onSortChange={setSortMode}
        filteredCount={filteredIssues.length}
        totalCount={issues.length}
      />

      {/* Active Heatmap Filter Badge */}
      {heatmapFilter && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm bg-[hsl(var(--indigo-100))] text-[hsl(var(--indigo-700))] rounded-full">
            {heatmapFilter.principle} · {heatmapFilter.severity}
            <button
              type="button"
              onClick={onClearHeatmapFilter}
              className="ml-1 hover:text-[hsl(var(--indigo-900))]"
              aria-label="Clear heatmap filter"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* Issue Cards */}
      <div className="space-y-3" role="list" aria-label="Accessibility issues">
        {filteredIssues.map(issue => (
          <div key={issue.id} role="listitem">
            <IssueCard
              issue={issue}
              isExpanded={expandedIssueId === issue.id}
              onToggle={() => handleToggleExpand(issue)}
              isSelected={selectedIssue?.id === issue.id}
              onOpenBeforeAfter={onOpenBeforeAfter}
            />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredIssues.length === 0 && (
        <div className="text-center py-8 text-[hsl(var(--color-text-secondary))]">
          <p>No issues match the current filters.</p>
        </div>
      )}
    </div>
  );
}
