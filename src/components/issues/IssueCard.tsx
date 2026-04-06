import { useCallback } from 'react';
import { ChevronRight, Shield, ShieldAlert, ShieldQuestion } from 'lucide-react';
import type { Issue } from '@/types/audit.types';
import { SeverityBadge } from './SeverityBadge';
import { getConfidenceForRule, getConfidenceBadgeClasses } from '@/lib/axiomConfidence';

interface IssueCardProps {
  issue: Issue;
  onSelect: () => void;
  isSelected?: boolean;
  isDismissed?: boolean;
  isMobile?: boolean;
}

export function IssueCard({ issue, onSelect, isSelected, isDismissed, isMobile }: IssueCardProps) {
  const confidence = getConfidenceForRule(issue.ruleId);

  const ConfidenceIcon = {
    confirmed: Shield,
    likely: ShieldAlert,
    review: ShieldQuestion,
  }[confidence.level];

  const borderColorMap = {
    critical: 'border-l-[hsl(var(--severity-critical-border))]',
    serious: 'border-l-[hsl(var(--severity-serious-border))]',
    moderate: 'border-l-[hsl(var(--severity-moderate-border))]',
    minor: 'border-l-[hsl(var(--severity-minor-border))]',
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  }, [onSelect]);

  return (
    <div
      className={`
        border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg overflow-hidden
        transition-colors hover:bg-[hsl(var(--color-bg-elevated))] hover:border-[hsl(var(--color-border-strong))]
        ${borderColorMap[issue.severity]} border-l-[3px]
        ${isSelected ? 'ring-2 ring-[hsl(var(--indigo-400))]' : ''}
        ${isDismissed ? 'opacity-50' : ''}
        ${isMobile && isSelected ? 'rounded-b-none ring-0 border-b-0' : ''}
      `}
    >
      <button
        type="button"
        onClick={onSelect}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center gap-3 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--indigo-400))]"
        aria-pressed={isSelected}
      >
        <SeverityBadge severity={issue.severity} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-medium text-[hsl(var(--color-text-primary))] truncate ${isDismissed ? 'line-through' : ''}`}>
              {issue.wcagCriterion} {issue.wcagCriterionName}
            </p>
            <span
              className={getConfidenceBadgeClasses(confidence.level)}
              aria-label={`Detection confidence: ${confidence.label}`}
              title={confidence.description}
            >
              <ConfidenceIcon className="w-3 h-3 mr-1" aria-hidden="true" />
              {confidence.label}
            </span>
          </div>
          <p className="text-sm text-[hsl(var(--color-text-secondary))] mt-0.5">
            {issue.affectedCount} {issue.affectedCount === 1 ? 'element' : 'elements'}
            {isDismissed && <span className="ml-2 text-xs italic">Dismissed</span>}
          </p>
        </div>

        <ChevronRight
          className={`w-4 h-4 flex-shrink-0 transition-all ${isSelected ? 'text-[hsl(var(--indigo-500))]' : 'text-[hsl(var(--color-text-secondary))]'} ${isMobile && isSelected ? 'rotate-90' : ''}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
