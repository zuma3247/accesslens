import type { Issue } from '@/types/audit.types';
import { getConfidenceForRule, generateDismissalKey } from '@/lib/axiomConfidence';
import { Info } from 'lucide-react';
import { useState } from 'react';

interface TriagedScoreProps {
  issues: Issue[];
  dismissedIssueIds: Set<string>;
  scanMode?: string;
}

export function TriagedScore({ issues, dismissedIssueIds, scanMode = 'unknown' }: TriagedScoreProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const triagedMetrics = (() => {
    let dismissedCount = 0;
    let needsReviewCount = 0;
    let confirmedAndLikelyCount = 0;

    for (const issue of issues) {
      const dismissalKey = generateDismissalKey(scanMode, issue.ruleId, issue.id);
      if (dismissedIssueIds.has(dismissalKey)) {
        dismissedCount++;
        continue;
      }

      const confidence = getConfidenceForRule(issue.ruleId);
      if (confidence.level === 'review') {
        needsReviewCount++;
      } else {
        confirmedAndLikelyCount++;
      }
    }

    const triageableIssues = confirmedAndLikelyCount + needsReviewCount;
    const score = triageableIssues > 0
      ? Math.round((confirmedAndLikelyCount / triageableIssues) * 100)
      : 100;

    const grade: 'A' | 'B' | 'F' = score >= 90 ? 'A' : score >= 60 ? 'B' : 'F';
    const excludedCount = dismissedCount + needsReviewCount;

    return {
      score,
      grade,
      dismissedCount,
      needsReviewCount,
      excludedCount,
    };
  })();

  const { score, grade, dismissedCount, needsReviewCount, excludedCount } = triagedMetrics;

  if (excludedCount === 0 && score >= 90) {
    return null;
  }

  const getScoreColor = () => {
    if (score >= 90) return 'text-[hsl(var(--score-high))]';
    if (score >= 60) return 'text-[hsl(var(--score-mid))]';
    return 'text-[hsl(var(--score-low))]';
  };

  const tooltipText = `Calculated from confirmed and likely violations only, excluding ${dismissedCount} dismissed and ${needsReviewCount} "Needs Review" items.`;

  return (
    <div className="mt-4 pt-4 border-t border-[hsl(var(--color-border))]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
            Triaged Score
          </span>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              className="p-1 rounded-md hover:bg-[hsl(var(--color-bg-elevated))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
              aria-label={tooltipText}
            >
              <Info className="w-4 h-4 text-[hsl(var(--color-text-secondary))]" aria-hidden="true" />
            </button>
            {showTooltip && (
              <div
                role="tooltip"
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 px-3 py-2 text-xs text-[hsl(var(--color-text-inverse))] bg-[hsl(var(--slate-800))] dark:bg-[hsl(var(--slate-200))] dark:text-[hsl(var(--slate-900))] rounded-md shadow-lg z-10"
              >
                {tooltipText}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${getScoreColor()}`} aria-label={`Triaged accessibility score: ${score} percent`}>
            {score}%
          </span>
          <span className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
            {grade}
          </span>
        </div>
      </div>
      <p className="mt-1 text-xs text-[hsl(var(--color-text-secondary))]">
        After removing {excludedCount} item{excludedCount !== 1 ? 's' : ''} ({dismissedCount} dismissed, {needsReviewCount} &ldquo;Needs Review&rdquo;)
      </p>
    </div>
  );
}
