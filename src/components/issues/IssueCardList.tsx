import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { Issue, IssueSeverity, WcagPrinciple, SortMode, HeatmapFilter, ConfidenceLevel } from '@/types/audit.types';
import { IssueCard } from './IssueCard';
import { FilterBar } from './FilterBar';
import { getConfidenceForRule, generateDismissalKey, dismissViolation, restoreViolation } from '@/lib/axiomConfidence';
import { ChevronDown } from 'lucide-react';

interface IssueCardListProps {
  issues: Issue[];
  heatmapFilter: HeatmapFilter | null;
  onClearHeatmapFilter: () => void;
  selectedIssue: Issue | null;
  onSelectIssue: (issue: Issue | null) => void;
  onOpenBeforeAfter: ((issue: Issue, triggerElement?: HTMLElement) => void) | undefined;
  scanMode?: string;
  dismissedKeys: Set<string>;
  onDismissedKeysChange: (keys: Set<string>) => void;
}

export function IssueCardList({
  issues,
  heatmapFilter,
  onClearHeatmapFilter,
  selectedIssue,
  onSelectIssue,
  onOpenBeforeAfter,
  scanMode = 'unknown',
  dismissedKeys,
  onDismissedKeysChange,
}: IssueCardListProps) {
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | null>(null);
  const [principleFilter, setPrincipleFilter] = useState<WcagPrinciple | null>(null);
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceLevel | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('severity');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [showDismissedAccordion, setShowDismissedAccordion] = useState(false);
  const expandedIssueIdRef = useRef<string | null>(expandedIssueId);

  useEffect(() => {
    expandedIssueIdRef.current = expandedIssueId;
  }, [expandedIssueId]);

  // Generate dismissal key for an issue
  const getIssueKey = useCallback((issue: Issue): string => {
    return generateDismissalKey(scanMode, issue.ruleId, issue.id);
  }, [scanMode]);

  // Check if an issue is dismissed
  const isIssueDismissed = useCallback((issue: Issue): boolean => {
    return dismissedKeys.has(getIssueKey(issue));
  }, [dismissedKeys, getIssueKey]);

  // Handle dismiss action
  const handleDismiss = useCallback((issue: Issue) => {
    const key = getIssueKey(issue);
    dismissViolation(key);
    const newKeys = new Set(dismissedKeys);
    newKeys.add(key);
    onDismissedKeysChange(newKeys);
  }, [getIssueKey, dismissedKeys, onDismissedKeysChange]);

  // Handle restore action
  const handleRestore = useCallback((issue: Issue) => {
    const key = getIssueKey(issue);
    restoreViolation(key);
    const newKeys = new Set(dismissedKeys);
    newKeys.delete(key);
    onDismissedKeysChange(newKeys);
  }, [getIssueKey, dismissedKeys, onDismissedKeysChange]);

  // Split issues into active and dismissed
  const { activeIssues, dismissedIssues } = useMemo(() => {
    const active: Issue[] = [];
    const dismissed: Issue[] = [];

    for (const issue of issues) {
      if (isIssueDismissed(issue)) {
        dismissed.push(issue);
      } else {
        active.push(issue);
      }
    }

    return { activeIssues: active, dismissedIssues: dismissed };
  }, [issues, isIssueDismissed]);

  // Combine all filters for active issues
  const filteredActiveIssues = useMemo(() => {
    let result = [...activeIssues];

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

    // Apply confidence filter
    if (confidenceFilter) {
      result = result.filter(issue => {
        const confidence = getConfidenceForRule(issue.ruleId);
        return confidence.level === confidenceFilter;
      });
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
  }, [activeIssues, heatmapFilter, severityFilter, principleFilter, confidenceFilter, sortMode]);

  const handleToggleExpand = useCallback(
    (issue: Issue) => {
      const prev = expandedIssueIdRef.current;
      const nextId = prev === issue.id ? null : issue.id;
      expandedIssueIdRef.current = nextId;
      setExpandedIssueId(nextId);
      onSelectIssue(nextId === issue.id ? issue : null);
    },
    [onSelectIssue],
  );

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <FilterBar
        severityFilter={severityFilter}
        principleFilter={principleFilter}
        confidenceFilter={confidenceFilter}
        sortMode={sortMode}
        onSeverityChange={setSeverityFilter}
        onPrincipleChange={setPrincipleFilter}
        onConfidenceChange={setConfidenceFilter}
        onSortChange={setSortMode}
        filteredCount={filteredActiveIssues.length}
        totalCount={activeIssues.length}
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

      {/* Active Issue Cards */}
      <div className="space-y-3" role="list" aria-label="Accessibility issues">
        {filteredActiveIssues.map(issue => (
          <div key={issue.id} role="listitem">
            <IssueCard
              issue={issue}
              isExpanded={expandedIssueId === issue.id}
              onToggle={() => handleToggleExpand(issue)}
              isSelected={selectedIssue?.id === issue.id}
              isDismissed={false}
              onDismiss={handleDismiss}
              onOpenBeforeAfter={onOpenBeforeAfter}
            />
          </div>
        ))}
      </div>

      {/* Empty State for Active Issues */}
      {filteredActiveIssues.length === 0 && activeIssues.length > 0 && (
        <div className="text-center py-8 text-[hsl(var(--color-text-secondary))]">
          <p>No issues match the current filters.</p>
        </div>
      )}

      {activeIssues.length === 0 && dismissedIssues.length === 0 && (
        <div className="text-center py-8 text-[hsl(var(--color-text-secondary))]">
          <p>No accessibility issues found.</p>
        </div>
      )}

      {/* Dismissed Violations Accordion */}
      {dismissedIssues.length > 0 && (
        <details
          className="mt-6 border border-[hsl(var(--color-border))] rounded-lg"
          open={showDismissedAccordion}
          onToggle={(e) => setShowDismissedAccordion(e.currentTarget.open)}
        >
          <summary
            className="flex items-center justify-between px-4 py-3 bg-[hsl(var(--color-bg-surface))] rounded-lg cursor-pointer hover:bg-[hsl(var(--color-bg-elevated))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
            aria-label={`Dismissed violations, ${dismissedIssues.length} items`}
          >
            <span className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
              Dismissed Violations ({dismissedIssues.length})
            </span>
            <ChevronDown
              className={`w-4 h-4 text-[hsl(var(--color-text-secondary))] transition-transform ${showDismissedAccordion ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </summary>
          <div className="p-4 space-y-3 border-t border-[hsl(var(--color-border))]">
            {dismissedIssues.map(issue => (
              <div key={issue.id} role="listitem">
                <IssueCard
                  issue={issue}
                  isExpanded={expandedIssueId === issue.id}
                  onToggle={() => handleToggleExpand(issue)}
                  isSelected={selectedIssue?.id === issue.id}
                  isDismissed={true}
                  onRestore={handleRestore}
                  onOpenBeforeAfter={onOpenBeforeAfter}
                />
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
