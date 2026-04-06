import { useState, useCallback, useRef } from 'react';
import { ExternalLink, Copy, Check, Shield, ShieldAlert, ShieldQuestion, ChevronDown, ChevronUp, RotateCcw, X } from 'lucide-react';
import type { Issue } from '@/types/audit.types';
import type { DismissalReason } from '@/lib/axiomConfidence';
import { DISMISSAL_REASONS, getConfidenceForRule, getConfidenceBadgeClasses, generateDismissalKey } from '@/lib/axiomConfidence';
import { SeverityBadge } from './SeverityBadge';
import { CopyFixPromptButton } from '../prompt/CopyFixPromptButton';

interface IssueDetailProps {
  issue: Issue | null;
  onOpenBeforeAfter: ((issue: Issue, triggerElement?: HTMLElement) => void) | undefined;
  scanMode: string;
  dismissedKeys: Set<string>;
  onDismiss: (issue: Issue, reason: DismissalReason) => void;
  onRestore: (issue: Issue) => void;
}

function CodeSnippet({ code }: { code: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = code.length > 120;
  const display = isLong && !expanded ? code.slice(0, 120) + '…' : code;
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [code]);

  return (
    <div className="relative group">
      <pre className="text-xs bg-[hsl(var(--color-bg-base))] border border-[hsl(var(--color-border))] rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[hsl(var(--color-text-primary))] leading-relaxed">
        {display}
      </pre>
      <div className="flex items-center justify-between mt-1">
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-[hsl(var(--indigo-600))] hover:underline flex items-center gap-0.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--indigo-400))] rounded"
          >
            {expanded ? <ChevronUp className="w-3 h-3" aria-hidden="true" /> : <ChevronDown className="w-3 h-3" aria-hidden="true" />}
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code snippet'}
          className="ml-auto text-xs flex items-center gap-1 text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))] focus:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--indigo-400))] rounded px-1"
        >
          {copied ? <Check className="w-3 h-3" aria-hidden="true" /> : <Copy className="w-3 h-3" aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

function DismissPopover({
  onConfirm,
  onCancel,
}: {
  onConfirm: (reason: DismissalReason) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState<DismissalReason>('custom-component');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Dismiss violation"
      className="absolute bottom-full right-0 mb-2 w-72 bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-lg shadow-lg p-4 z-20"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[hsl(var(--color-text-primary))]">Dismiss violation</p>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel dismissal"
          className="text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] rounded"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      <label htmlFor="dismiss-reason" className="block text-xs text-[hsl(var(--color-text-secondary))] mb-1">
        Reason
      </label>
      <select
        id="dismiss-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value as DismissalReason)}
        className="w-full text-xs bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-md px-2 py-1.5 text-[hsl(var(--color-text-primary))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] mb-3"
      >
        {DISMISSAL_REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onConfirm(reason)}
          className="flex-1 px-3 py-1.5 text-xs font-medium bg-[hsl(var(--indigo-600))] text-white rounded-md hover:bg-[hsl(var(--indigo-700))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] transition-colors"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 py-1.5 text-xs font-medium bg-[hsl(var(--color-bg-surface))] text-[hsl(var(--color-text-secondary))] border border-[hsl(var(--color-border))] rounded-md hover:bg-[hsl(var(--color-bg-elevated))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function IssueDetail({ issue, onOpenBeforeAfter, scanMode, dismissedKeys, onDismiss, onRestore }: IssueDetailProps) {
  const beforeAfterButtonRef = useRef<HTMLButtonElement>(null);
  const [showDismissPopover, setShowDismissPopover] = useState(false);

  const handleOpenBeforeAfter = useCallback(() => {
    if (onOpenBeforeAfter && issue && beforeAfterButtonRef.current) {
      onOpenBeforeAfter(issue, beforeAfterButtonRef.current);
    }
  }, [issue, onOpenBeforeAfter]);

  const handleDismissConfirm = useCallback((reason: DismissalReason) => {
    if (issue) {
      onDismiss(issue, reason);
      setShowDismissPopover(false);
    }
  }, [issue, onDismiss]);

  const handleRestore = useCallback(() => {
    if (issue) onRestore(issue);
  }, [issue, onRestore]);

  if (!issue) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 mb-4 text-[hsl(var(--color-text-secondary))]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" />
          </svg>
        </div>
        <p className="text-[hsl(var(--color-text-secondary))]">Select an issue to see its full detail</p>
      </div>
    );
  }

  const confidence = getConfidenceForRule(issue.ruleId);
  const ConfidenceIcon = { confirmed: Shield, likely: ShieldAlert, review: ShieldQuestion }[confidence.level];
  const isDismissed = dismissedKeys.has(generateDismissalKey(scanMode, issue.ruleId, issue.id));

  return (
    <div className="p-4 space-y-4" aria-live="polite">
      {/* 1. Severity + criterion + count */}
      <div className="space-y-1.5">
        <div className="flex items-start gap-2 flex-wrap">
          <SeverityBadge severity={issue.severity} />
          {isDismissed && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-[hsl(var(--color-bg-elevated))] text-[hsl(var(--color-text-secondary))] border border-[hsl(var(--color-border))]">
              Dismissed
            </span>
          )}
        </div>
        <p className={`font-semibold text-[hsl(var(--color-text-primary))] leading-snug ${isDismissed ? 'line-through opacity-60' : ''}`}>
          {issue.wcagCriterion} {issue.wcagCriterionName}
        </p>
        <p className="text-xs text-[hsl(var(--color-text-secondary))]">
          {issue.affectedCount} {issue.affectedCount === 1 ? 'element' : 'elements'} affected
          {' · '}WCAG {issue.wcagLevel}
        </p>
      </div>

      {/* 2. Detection confidence */}
      <div className={`flex items-start gap-2 px-3 py-2.5 rounded-md border ${
        confidence.level === 'confirmed'
          ? 'bg-[hsl(var(--indigo-50))] dark:bg-[hsl(var(--indigo-950))] border-[hsl(var(--indigo-200))] dark:border-[hsl(var(--indigo-800))]'
          : confidence.level === 'likely'
          ? 'bg-[hsl(var(--amber-50,56_100%_97%))] dark:bg-[hsl(220_14%_12%)] border-[hsl(var(--color-border))]'
          : 'bg-[hsl(var(--color-bg-elevated))] border-[hsl(var(--color-border))]'
      }`}>
        <span className={`mt-0.5 flex-shrink-0 ${getConfidenceBadgeClasses(confidence.level)}`} aria-hidden="true">
          <ConfidenceIcon className="w-3.5 h-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[hsl(var(--color-text-primary))]">{confidence.label}</p>
          <p className="text-xs text-[hsl(var(--color-text-secondary))] mt-0.5">{confidence.description}</p>
        </div>
      </div>

      {/* 3. Affected element code snippet */}
      {issue.codeSnippet && (
        <div>
          <p className="text-xs font-medium text-[hsl(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
            Affected element
          </p>
          <CodeSnippet code={issue.codeSnippet} />
        </div>
      )}

      {/* 4. Description */}
      <div>
        <p className="text-xs font-medium text-[hsl(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
          Description
        </p>
        <p className="text-sm text-[hsl(var(--color-text-primary))] leading-relaxed">{issue.description}</p>
      </div>

      {/* 5. Fix suggestion */}
      <div className="bg-[hsl(var(--indigo-50))] dark:bg-[hsl(var(--indigo-950))] border border-[hsl(var(--indigo-200))] dark:border-[hsl(var(--indigo-800))] px-3 py-2.5 rounded-md">
        <p className="text-xs font-semibold text-[hsl(var(--indigo-700))] dark:text-[hsl(var(--indigo-300))] mb-1">Suggested fix</p>
        <p className="text-sm text-[hsl(var(--color-text-primary))] leading-relaxed">{issue.fixSuggestion}</p>
      </div>

      {/* 6. Code fix example */}
      {issue.codeFixExample && (
        <div>
          <p className="text-xs font-medium text-[hsl(var(--color-text-secondary))] uppercase tracking-wide mb-1.5">
            Code example
          </p>
          <CodeSnippet code={issue.codeFixExample} />
        </div>
      )}

      {/* 7. Actions */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[hsl(var(--color-border))]">
        <CopyFixPromptButton issue={issue} />

        {issue.hasBeforeAfter && issue.beforeAfterType && (
          <button
            ref={beforeAfterButtonRef}
            type="button"
            onClick={handleOpenBeforeAfter}
            className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-xs font-medium text-[hsl(var(--color-text-secondary))] bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-md hover:text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-bg-base))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
          >
            View Before/After →
          </button>
        )}

        <a
          href={issue.helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 w-full px-3 py-1.5 text-xs text-[hsl(var(--indigo-600))] hover:text-[hsl(var(--indigo-700))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] rounded-md"
          aria-label={`View WCAG criterion ${issue.wcagCriterion} documentation (opens in new tab)`}
        >
          View WCAG Criterion
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>

        {/* 8. Dismiss / Restore */}
        <div className="relative">
          {isDismissed ? (
            <button
              type="button"
              onClick={handleRestore}
              className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-xs font-medium text-[hsl(var(--color-text-secondary))] bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-md hover:text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-bg-base))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              Restore violation
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowDismissPopover((v) => !v)}
              aria-expanded={showDismissPopover}
              className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-xs font-medium text-[hsl(var(--color-text-secondary))] bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-md hover:text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-bg-base))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
            >
              Dismiss as false positive
            </button>
          )}

          {showDismissPopover && !isDismissed && (
            <DismissPopover
              onConfirm={handleDismissConfirm}
              onCancel={() => setShowDismissPopover(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
