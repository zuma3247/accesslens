import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, ExternalLink, ClipboardCopy, Check, Shield, ShieldAlert, ShieldQuestion, X } from 'lucide-react';
import type { Issue } from '@/types/audit.types';
import { SeverityBadge } from './SeverityBadge';
import { CopyFixPromptButton } from '../prompt/CopyFixPromptButton';
import { getConfidenceForRule, getConfidenceBadgeClasses, DISMISSAL_REASONS, type DismissalReason } from '@/lib/axiomConfidence';

interface IssueCardProps {
  issue: Issue;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected?: boolean;
  isDismissed?: boolean;
  onDismiss?: (issue: Issue, reason: DismissalReason) => void;
  onRestore?: (issue: Issue) => void;
  onOpenBeforeAfter: ((issue: Issue, triggerElement?: HTMLElement) => void) | undefined;
}

function CodeFixExample({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      // Silently fail — the full prompt copy button is the primary action
    }
  }, [code]);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
        Example fix:
      </p>
      <div className="relative group">
        <code className="block p-3 pr-10 bg-[hsl(var(--color-code-example-bg))] text-[hsl(var(--color-code-example-text))] rounded-md text-sm font-mono overflow-x-auto">
          {code}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
          aria-label="Copy code fix example to clipboard"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-[hsl(var(--color-success))]" aria-hidden="true" />
          ) : (
            <ClipboardCopy className="w-3.5 h-3.5 text-[hsl(var(--color-text-secondary))]" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

export function IssueCard({ 
  issue, 
  isExpanded, 
  onToggle, 
  isSelected, 
  isDismissed,
  onDismiss,
  onRestore,
  onOpenBeforeAfter 
}: IssueCardProps) {
  const [showCodeExpanded, setShowCodeExpanded] = useState(false);
  const [showDismissPopover, setShowDismissPopover] = useState(false);
  const [dismissReason, setDismissReason] = useState<DismissalReason>('other');
  const beforeAfterButtonRef = useRef<HTMLButtonElement>(null);
  const dismissButtonRef = useRef<HTMLButtonElement>(null);
  const dismissPopoverRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Close dismiss popover on Escape or click outside
  useEffect(() => {
    if (!showDismissPopover) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setShowDismissPopover(false);
        dismissButtonRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dismissPopoverRef.current &&
        !dismissPopoverRef.current.contains(e.target as Node) &&
        !dismissButtonRef.current?.contains(e.target as Node)
      ) {
        setShowDismissPopover(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDismissPopover]);

  const confidence = getConfidenceForRule(issue.ruleId);

  const handleOpenBeforeAfter = useCallback(() => {
    if (onOpenBeforeAfter && beforeAfterButtonRef.current) {
      onOpenBeforeAfter(issue, beforeAfterButtonRef.current);
    }
  }, [issue, onOpenBeforeAfter]);

  const handleDismiss = useCallback(() => {
    if (onDismiss) {
      onDismiss(issue, dismissReason);
    }
    setShowDismissPopover(false);
  }, [issue, onDismiss, dismissReason]);

  const handleRestore = useCallback(() => {
    if (onRestore) {
      onRestore(issue);
    }
  }, [issue, onRestore]);

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

  const ConfidenceIcon = {
    confirmed: Shield,
    likely: ShieldAlert,
    review: ShieldQuestion,
  }[confidence.level];

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
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <SeverityBadge severity={issue.severity} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-[hsl(var(--color-text-primary))] truncate">
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
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
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

            {/* Confidence Explanation */}
            <div className="bg-[hsl(var(--color-bg-elevated))] p-3 rounded-md border border-[hsl(var(--color-border))]">
              <p className="text-sm font-medium text-[hsl(var(--color-text-secondary))] mb-1">
                Detection Confidence: {confidence.label}
              </p>
              <p className="text-sm text-[hsl(var(--color-text-primary))]">
                {confidence.description}
              </p>
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
              <CodeFixExample code={issue.codeFixExample} />
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

              {/* Dismiss Button - only for non-dismissed issues */}
              {!isDismissed && onDismiss && (
                <div className="relative">
                  <button
                    ref={dismissButtonRef}
                    type="button"
                    onClick={() => setShowDismissPopover(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-error))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] rounded-md"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                    Dismiss
                  </button>

                  {/* Dismiss Popover */}
                  {showDismissPopover && (
                    <div
                      ref={dismissPopoverRef}
                      className="absolute z-10 mt-2 right-0 w-72 bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-lg shadow-lg p-4"
                      role="dialog"
                      aria-labelledby={`dismiss-title-${issue.id}`}
                    >
                      <h3 id={`dismiss-title-${issue.id}`} className="text-sm font-medium text-[hsl(var(--color-text-primary))] mb-3">
                        Dismiss as false positive?
                      </h3>
                      <label htmlFor={`dismiss-reason-${issue.id}`} className="block text-sm text-[hsl(var(--color-text-secondary))] mb-2">
                        Reason:
                      </label>
                      <select
                        id={`dismiss-reason-${issue.id}`}
                        value={dismissReason}
                        onChange={(e) => setDismissReason(e.target.value as DismissalReason)}
                        className="w-full px-3 py-2 text-sm bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-md focus:outline-none focus:ring-2 focus:ring-[hsl(var(--indigo-400))] mb-3"
                      >
                        {DISMISSAL_REASONS.map((reason) => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleDismiss}
                          className="flex-1 px-3 py-2 text-sm font-medium text-[hsl(var(--slate-50))] bg-[hsl(var(--color-error))] hover:bg-[hsl(var(--color-error))]/90 rounded-md transition-colors"
                        >
                          Confirm Dismiss
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDismissPopover(false)}
                          className="flex-1 px-3 py-2 text-sm font-medium text-[hsl(var(--color-text-secondary))] bg-[hsl(var(--color-bg-surface))] hover:bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Restore Button - only for dismissed issues */}
              {isDismissed && onRestore && (
                <button
                  type="button"
                  onClick={handleRestore}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[hsl(var(--color-success))] hover:text-[hsl(var(--color-success))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] rounded-md"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Restore
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
