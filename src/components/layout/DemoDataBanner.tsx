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

  const isMock = payload.source === 'mock';
  const isFallback = Boolean(payload.isFallback);

  // Derive variant: live scan, known demo URL (curated seed), or unrecognised fallback seed
  type Variant = 'live' | 'demo' | 'fallback';
  const variant: Variant = !isMock ? 'live' : isFallback ? 'fallback' : 'demo';

  const bannerStyles: Record<Variant, { wrapper: string; icon: string }> = {
    live: {
      wrapper: 'bg-[hsl(var(--color-info)/0.12)] border-[hsl(var(--color-info)/0.35)]',
      icon: 'text-[hsl(var(--color-info))]',
    },
    demo: {
      wrapper: 'bg-[hsl(var(--color-info)/0.08)] border-[hsl(var(--color-border))]',
      icon: 'text-[hsl(var(--color-text-secondary))]',
    },
    fallback: {
      wrapper: 'bg-[hsl(var(--color-warning)/0.12)] border-[hsl(var(--color-warning)/0.35)]',
      icon: 'text-[hsl(var(--color-warning))]',
    },
  };

  const { wrapper, icon } = bannerStyles[variant];

  return (
    <div
      className={`mb-6 p-4 rounded-lg border ${wrapper}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${icon}`}
          aria-hidden="true"
        />
        <div className="space-y-1 min-w-0">
          {variant === 'live' && (
            <>
              <p className="font-medium text-[hsl(var(--color-text-primary))]">
                Live URL Scan — Results were generated from the actual page HTML for{' '}
                <span className="font-semibold break-all">{payload.auditedInput}</span>.
              </p>
              <p className="text-sm text-[hsl(var(--color-text-secondary))]">
                Client-side scans may miss dynamic JavaScript-rendered content or externally loaded stylesheets.
              </p>
            </>
          )}
          {variant === 'demo' && (
            <>
              <p className="font-medium text-[hsl(var(--color-text-primary))]">
                Sample results for this demo URL — not a live scan.
              </p>
              <p className="text-sm text-[hsl(var(--color-text-secondary))]">
                These are curated example violations to demonstrate AccessLens features. Paste real HTML or enter a different URL for an actual audit.
              </p>
            </>
          )}
          {variant === 'fallback' && (
            <>
              <p className="font-medium text-[hsl(var(--color-text-primary))]">
                Demo Data — This result is a representative example, not an analysis of{' '}
                <span className="font-semibold break-all">{payload.auditedInput}</span>.
              </p>
              <p className="text-sm text-[hsl(var(--color-text-secondary))]">
                Live URL fetching was unavailable (usually due to CORS or network restrictions), so AccessLens used sample fallback data.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
