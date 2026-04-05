import type { AuditPayload } from '@/types/audit.types';
import { AlertTriangle } from 'lucide-react';

interface DemoDataBannerProps {
  payload: AuditPayload;
}

export function DemoDataBanner({ payload }: DemoDataBannerProps) {
  // Only show for URL scan mode with demo/seed data
  if (payload.scanMode !== 'url') {
    return null;
  }

  return (
    <div
      className="mb-6 p-4 bg-[hsl(var(--color-warning-bg))] border border-[hsl(var(--color-warning-border))] rounded-lg"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="w-5 h-5 text-[hsl(var(--color-warning-text))] flex-shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="font-medium text-[hsl(var(--color-warning-text))]">
            Demo Data — This result is a representative example, not an analysis of{' '}
            <span className="font-semibold">{payload.auditedInput}</span>.
          </p>
          <p className="text-sm text-[hsl(var(--color-text-secondary))]">
            To scan your actual HTML, use the &ldquo;HTML Snippet&rdquo; tab: paste your page source and get
            real axe-core results with live violation callouts on your actual content.
          </p>
        </div>
      </div>
    </div>
  );
}
