import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ExternalLink } from 'lucide-react';
import type { Issue } from '@/types/audit.types';
import { SeverityBadge } from './SeverityBadge';
import { CopyFixPromptButton } from '../prompt/CopyFixPromptButton';

interface IssueCardProps {
  issue: Issue;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected?: boolean;
  onOpenBeforeAfter: ((issue: Issue, triggerElement?: HTMLElement) => void) | undefined;
}

export function IssueCard({ issue, isExpanded, onToggle, isSelected, onOpenBeforeAfter }: IssueCardProps) {
  const [showCodeExpanded, setShowCodeExpanded] = useState(false);
  const beforeAfterButtonRef = useRef<HTMLButtonElement>(null);

  const handleOpenBeforeAfter = useCallback(() => {
    if (onOpenBeforeAfter && beforeAfterButtonRef.current) {
      onOpenBeforeAfter(issue, beforeAfterButtonRef.current);
    }
  }, [issue, onOpenBeforeAfter]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    } else if (e.key === 'Escape' && isExpanded) {
      e.preventDefault();
      onToggle();
    }
  }, [isExpanded, onToggle]);

  const borderColorMap = {
    critical: 'border-l-[hsl(var(--severity-critical-border))]',
    serious: 'border-l-[hsl(var(--severity-serious-border))]',
    moderate: 'border-l-[hsl(var(--severity-moderate-border))]',
    minor: 'border-l-[hsl(var(--severity-minor-border))]',
  };

  const truncatedCode = issue.codeSnippet.length > 120 && !showCodeExpanded
    ? issue.codeSnippet.slice(0, 117) + '...'
    : issue.codeSnippet;

  return (
    <div
      className={`
        border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] rounded-lg overflow-hidden
        transition-colors hover:bg-[hsl(var(--color-bg-elevated))] hover:border-[hsl(var(--color-border-strong))]
        ${borderColorMap[issue.severity]} border-l-[3px]
        ${isSelected ? 'ring-2 ring-[hsl(var(--indigo-400))]' : ''}
      `}
    >
      {/* Collapsed Header */}
      <button
        type="button"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[hsl(var(--indigo-400))]"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <SeverityBadge severity={issue.severity} />
          <div>
            <p className="font-medium text-[hsl(var(--color-text-primary))]">
              {issue.wcagCriterion} {issue.wcagCriterionName}
            </p>
            <p className="text-sm text-[hsl(var(--color-text-secondary))]">
              {issue.affectedCount} {issue.affectedCount === 1 ? 'element' : 'elements'}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-[hsl(var(--color-text-secondary))] transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-[hsl(var(--color-border))]"
        >
          <div className="p-4 space-y-4">
            {/* Code Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
                  Affected element:
                </p>
              </div>
              <div className="relative">
                <code className="block p-3 bg-[hsl(var(--color-code-bg))] text-[hsl(var(--color-code-text))] rounded-md text-sm font-mono overflow-x-auto">
                  {truncatedCode}
                </code>
                {issue.codeSnippet.length > 120 && (
                  <button
                    type="button"
                    onClick={() => setShowCodeExpanded(!showCodeExpanded)}
                    className="mt-1 text-xs text-[hsl(var(--indigo-600))] hover:text-[hsl(var(--indigo-700))]"
                  >
                    {showCodeExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-[hsl(var(--color-text-primary))]">{issue.description}</p>
            </div>

            {/* Fix Suggestion */}
            <div className="bg-[hsl(var(--indigo-50))] dark:bg-[hsl(var(--indigo-900))] p-3 rounded-md">
              <p className="text-sm text-[hsl(var(--color-text-primary))]">
                <strong>Fix:</strong> {issue.fixSuggestion}
              </p>
            </div>

            {/* Code Fix Example */}
            {issue.codeFixExample && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
                  Example fix:
                </p>
                <code className="block p-3 bg-[hsl(var(--color-code-example-bg))] text-[hsl(var(--color-code-example-text))] rounded-md text-sm font-mono overflow-x-auto">
                  {issue.codeFixExample}
                </code>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {/* View WCAG Criterion */}
              <a
                href={issue.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[hsl(var(--indigo-600))] hover:text-[hsl(var(--indigo-700))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] rounded-md"
                aria-label={`View WCAG criterion ${issue.wcagCriterion} documentation (opens in new tab)`}
              >
                View WCAG Criterion
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>

              {/* Before/After Button */}
              {issue.hasBeforeAfter && issue.beforeAfterType && (
                <button
                  ref={beforeAfterButtonRef}
                  type="button"
                  onClick={handleOpenBeforeAfter}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] rounded-md"
                >
                  View Before/After →
                </button>
              )}

              <CopyFixPromptButton issue={issue} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
