import type { AuditPayload } from '@/types/audit.types';
import { AlertTriangle } from 'lucide-react';

interface DemoDataBannerProps {
  payload: AuditPayload;
}

export function DemoDataBanner({ payload }: DemoDataBannerProps) {
  // Only show for URL scan mode
  if (payload.scanMode !== 'url') {
    return null;
  }

  const isFallback = Boolean(payload.isFallback);

  return (
    <div
      className={`mb-6 p-4 rounded-lg border ${
        isFallback
          ? 'bg-[hsl(var(--color-warning)/0.12)] border-[hsl(var(--color-warning)/0.35)]'
          : 'bg-[hsl(var(--color-info)/0.12)] border-[hsl(var(--color-info)/0.35)]'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            isFallback ? 'text-[hsl(var(--color-warning))]' : 'text-[hsl(var(--color-info))]'
          }`}
          aria-hidden="true"
        />
        <div className="space-y-1">
          {isFallback ? (
            <>
              <p className="font-medium text-[hsl(var(--color-text-primary))]">
                Demo Data — This result is a representative example, not an analysis of{' '}
                <span className="font-semibold">{payload.auditedInput}</span>.
              </p>
              <p className="text-sm text-[hsl(var(--color-text-secondary))]">
                Live URL fetching was unavailable (usually due to CORS or network restrictions), so AccessLens used sample fallback data.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-[hsl(var(--color-text-primary))]">
                Live URL Scan — Results were generated from the actual page HTML for{' '}
                <span className="font-semibold">{payload.auditedInput}</span>.
              </p>
              <p className="text-sm text-[hsl(var(--color-text-secondary))]">
                Client-side scans may miss dynamic JavaScript-rendered content or externally loaded stylesheets.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
