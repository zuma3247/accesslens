import { useState, useMemo, useCallback } from 'react';
import type { Issue, IssueSeverity, WcagPrinciple, SortMode, HeatmapFilter, ConfidenceLevel } from '@/types/audit.types';
import { IssueCard } from './IssueCard';
import { IssueDetail } from './IssueDetail';
import { FilterBar } from './FilterBar';
import { getConfidenceForRule, generateDismissalKey } from '@/lib/axiomConfidence';
import type { DismissalReason } from '@/lib/axiomConfidence';
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
  onDismiss: (issue: Issue, reason: DismissalReason) => void;
  onRestore: (issue: Issue) => void;
  isMobile?: boolean;
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
  onDismiss,
  onRestore,
  isMobile = false,
}: IssueCardListProps) {
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | null>(null);
  const [principleFilter, setPrincipleFilter] = useState<WcagPrinciple | null>(null);
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceLevel | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('severity');
  const [showDismissedAccordion, setShowDismissedAccordion] = useState(false);

  const isIssueDismissed = useCallback((issue: Issue): boolean => {
    return dismissedKeys.has(generateDismissalKey(scanMode, issue.ruleId, issue.id));
  }, [dismissedKeys, scanMode]);

  const { activeIssues, dismissedIssues } = useMemo(() => {
    const active: Issue[] = [];
    const dismissed: Issue[] = [];
    for (const issue of issues) {
      (isIssueDismissed(issue) ? dismissed : active).push(issue);
    }
    return { activeIssues: active, dismissedIssues: dismissed };
  }, [issues, isIssueDismissed]);

  const filteredActiveIssues = useMemo(() => {
    let result = [...activeIssues];

    if (heatmapFilter) {
      result = result.filter(
        (issue) => issue.principle === heatmapFilter.principle && issue.severity === heatmapFilter.severity,
      );
    }
    if (severityFilter) result = result.filter((i) => i.severity === severityFilter);
    if (principleFilter) result = result.filter((i) => i.principle === principleFilter);
    if (confidenceFilter) {
      result = result.filter((i) => getConfidenceForRule(i.ruleId).level === confidenceFilter);
    }

    result.sort((a, b) => {
      switch (sortMode) {
        case 'severity': {
          const order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
          return order[a.severity] - order[b.severity];
        }
        case 'criterion': return a.wcagCriterion.localeCompare(b.wcagCriterion);
        case 'count': return b.affectedCount - a.affectedCount;
        default: return 0;
      }
    });

    return result;
  }, [activeIssues, heatmapFilter, severityFilter, principleFilter, confidenceFilter, sortMode]);

  return (
    <div className="space-y-4">
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

      <div className="space-y-3" role="list" aria-label="Accessibility issues">
        {filteredActiveIssues.map((issue) => {
          const isSelected = selectedIssue?.id === issue.id;
          return (
            <div key={issue.id} role="listitem">
              <IssueCard
                issue={issue}
                onSelect={() => onSelectIssue(isSelected ? null : issue)}
                isSelected={isSelected}
                isDismissed={false}
                isMobile={isMobile}
              />
              {isMobile && isSelected && (
                <div className="border border-t-0 border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-b-lg overflow-hidden animate-accordion-down">
                  <IssueDetail
                    issue={issue}
                    onOpenBeforeAfter={onOpenBeforeAfter}
                    scanMode={scanMode}
                    dismissedKeys={dismissedKeys}
                    onDismiss={onDismiss}
                    onRestore={onRestore}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

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
            {dismissedIssues.map((issue) => {
              const isSelected = selectedIssue?.id === issue.id;
              return (
                <div key={issue.id} role="listitem">
                  <IssueCard
                    issue={issue}
                    onSelect={() => onSelectIssue(isSelected ? null : issue)}
                    isSelected={isSelected}
                    isDismissed={true}
                    isMobile={isMobile}
                  />
                  {isMobile && isSelected && (
                    <div className="border border-t-0 border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-b-lg overflow-hidden animate-accordion-down">
                      <IssueDetail
                        issue={issue}
                        onOpenBeforeAfter={onOpenBeforeAfter}
                        scanMode={scanMode}
                        dismissedKeys={dismissedKeys}
                        onDismiss={onDismiss}
                        onRestore={onRestore}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
