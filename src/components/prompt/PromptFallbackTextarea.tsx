import { useEffect, useRef } from 'react';
import { ClipboardCopy } from 'lucide-react';
import type { Issue } from '@/types/audit.types';
import { generateSinglePrompt } from '@/lib/promptGenerator';

interface PromptFallbackTextareaProps {
  issue: Issue;
}

export function PromptFallbackTextarea({ issue }: PromptFallbackTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const promptText = generateSinglePrompt(issue);

  useEffect(() => {
    // Auto-focus and select text after a small delay
    const timeoutId = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleRetryCopy = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      navigator.clipboard.writeText(promptText).catch(() => {
        // Still failing, keep the textarea visible
      });
    }
  };

  return (
    <div className="mt-4 p-3 bg-[hsl(var(--severity-serious-bg))] border border-[hsl(var(--severity-serious-border))] rounded-md">
      <div role="alert" className="flex items-start gap-2 text-sm text-[hsl(var(--severity-serious-text))] mb-2">
        <span>⚠</span>
        <span>
          Copy failed — clipboard access was blocked by your browser. 
          The fix prompt is shown below — press Ctrl+C (or ⌘C) to copy:
        </span>
      </div>
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          readOnly
          value={promptText}
          rows={6}
          className="w-full p-3 pr-10 bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-md text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-[hsl(var(--indigo-400))]"
        />
        <button
          type="button"
          onClick={handleRetryCopy}
          className="absolute top-2 right-2 p-1.5 text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))] bg-[hsl(var(--color-bg-surface))] rounded-md border border-[hsl(var(--color-border))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
          aria-label="Retry copy to clipboard"
        >
          <ClipboardCopy className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
