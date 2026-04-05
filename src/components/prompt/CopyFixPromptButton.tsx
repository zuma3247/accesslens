import { ClipboardCopy, Check } from 'lucide-react';
import type { Issue } from '@/types/audit.types';
import { useCopyPrompt } from '@/hooks/useCopyPrompt';
import { PromptFallbackTextarea } from './PromptFallbackTextarea';

interface CopyFixPromptButtonProps {
  issue: Issue;
}

export function CopyFixPromptButton({ issue }: CopyFixPromptButtonProps) {
  const { copy, copied, error } = useCopyPrompt(issue);

  const copyLabel = `Copy fix prompt for ${issue.wcagCriterion} ${issue.wcagCriterionName} to clipboard`;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : copyLabel}
        className={`
          inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md
          transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]
          ${copied
            ? 'bg-[hsl(var(--color-copied-bg))] text-[hsl(var(--color-copied-text))]'
            : 'bg-[hsl(var(--color-copy-btn-bg))] text-[hsl(var(--color-text-primary))] border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-copy-btn-hover))]'
          }
        `}
        title={copied ? 'Copied to clipboard!' : copyLabel}
      >
        <span aria-live="polite" className="inline-flex items-center gap-1.5">
          {copied ? (
            <>
              <Check className="w-4 h-4" aria-hidden="true" />
              <span className="hidden md:inline">Copied!</span>
            </>
          ) : (
            <>
              <ClipboardCopy className="w-4 h-4" aria-hidden="true" />
              <span className="hidden md:inline">Copy Fix Prompt</span>
            </>
          )}
        </span>
      </button>

      {error && <PromptFallbackTextarea issue={issue} />}
    </div>
  );
}
