import { ClipboardList, Check } from 'lucide-react';
import { useBatchCopy } from '@/hooks/useBatchCopy';
import type { AuditPayload } from '@/types/audit.types';

interface CopyAllCriticalButtonProps {
  payload: AuditPayload;
  onModalOpen: () => void;
}

export function CopyAllCriticalButton({ payload, onModalOpen }: CopyAllCriticalButtonProps) {
  const { copy, copied } = useBatchCopy(payload);

  const criticalCount = payload.issues.filter(i => i.severity === 'critical').length;

  // If no critical issues, show static badge
  if (criticalCount === 0) {
    return (
      <div
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[hsl(var(--color-copied-bg))] text-[hsl(var(--color-copied-text))] rounded-md"
        aria-label="No critical violations found in this audit"
      >
        <Check className="w-4 h-4" aria-hidden="true" />
        <span>No critical violations</span>
      </div>
    );
  }

  const handleClick = async () => {
    const success = await copy();
    if (!success) {
      onModalOpen();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={copied}
      className={`
        inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
        transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]
        ${copied
          ? 'bg-[hsl(var(--color-copied-bg))] text-[hsl(var(--color-copied-text))]'
          : 'bg-[hsl(var(--color-copy-btn-bg))] text-[hsl(var(--color-text-primary))] border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-copy-btn-hover))]'
        }
      `}
      aria-live="polite"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" aria-hidden="true" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <ClipboardList className="w-4 h-4" aria-hidden="true" />
          <span>Copy All Critical Fixes</span>
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-[hsl(var(--indigo-100))] text-[hsl(var(--indigo-700))] rounded-full">
            {criticalCount}
          </span>
        </>
      )}
    </button>
  );
}
