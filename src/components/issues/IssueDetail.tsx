import type { Issue } from '@/types/audit.types';
import { SeverityBadge } from './SeverityBadge';
import { ExternalLink } from 'lucide-react';
import { CopyFixPromptButton } from '../prompt/CopyFixPromptButton';

interface IssueDetailProps {
  issue: Issue | null;
}

export function IssueDetail({ issue }: IssueDetailProps) {
  if (!issue) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 mb-4 text-[hsl(var(--color-text-secondary))]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" />
          </svg>
        </div>
        <p className="text-[hsl(var(--color-text-secondary))]">
          Select an issue to see its full detail
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" aria-live="polite">
      {/* Header */}
      <div className="space-y-2">
        <SeverityBadge severity={issue.severity} />
        <h2 className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">
          {issue.wcagCriterion} {issue.wcagCriterionName}
        </h2>
        <p className="text-sm text-[hsl(var(--color-text-secondary))]">
          {issue.affectedCount} {issue.affectedCount === 1 ? 'element' : 'elements'} affected
        </p>
      </div>

      {/* Code Snippet */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
          Affected element:
        </p>
        <code className="block p-3 bg-[hsl(var(--slate-900))] text-[hsl(var(--slate-50))] rounded-md text-sm font-mono overflow-x-auto">
          {issue.codeSnippet}
        </code>
      </div>

      {/* Description */}
      <div>
        <p className="text-[hsl(var(--color-text-primary))]">{issue.description}</p>
      </div>

      {/* Fix Suggestion */}
      <div className="bg-[hsl(var(--indigo-50))] dark:bg-[hsl(var(--indigo-900))] p-4 rounded-md">
        <p className="text-[hsl(var(--color-text-primary))]">
          <strong>Fix:</strong> {issue.fixSuggestion}
        </p>
      </div>

      {/* Code Fix Example */}
      {issue.codeFixExample && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">
            Example fix:
          </p>
          <code className="block p-3 bg-[hsl(var(--slate-100))] dark:bg-[hsl(var(--slate-800))] text-[hsl(var(--slate-900))] dark:text-[hsl(var(--slate-100))] rounded-md text-sm font-mono overflow-x-auto">
            {issue.codeFixExample}
          </code>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-[hsl(var(--color-border))]">
        <a
          href={issue.helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-[hsl(var(--indigo-600))] hover:text-[hsl(var(--indigo-700))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] rounded-md"
          aria-label={`View WCAG criterion ${issue.wcagCriterion} documentation (opens in new tab)`}
        >
          View WCAG Criterion
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>

        {issue.hasBeforeAfter && issue.beforeAfterType && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] rounded-md"
          >
            View Before/After →
          </button>
        )}

        <CopyFixPromptButton issue={issue} />
      </div>
    </div>
  );
}
