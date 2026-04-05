import { Sun, Moon, RotateCcw, Palette } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import type { ViewState } from '@/types/audit.types';
import { TokenAuditorModal } from '@/components/token-auditor/TokenAuditorModal';

interface TopNavProps {
  viewState: ViewState;
  auditedUrl?: string | undefined;
  onNewScan: () => void;
}

export function TopNav({ viewState, auditedUrl, onNewScan }: TopNavProps) {
  const { theme, toggleTheme } = useTheme();
  const [isTokenAuditorOpen, setIsTokenAuditorOpen] = useState(false);
  const isDark = theme === 'dark';

  const isNewScanDisabled = viewState === 'idle' || viewState === 'loading';

  return (
    <header className="h-16 border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))] px-6 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center">
        <span className="text-xl font-semibold text-[hsl(var(--color-text-primary))]">
          Access
        </span>
        <span className="text-xl font-semibold text-[hsl(var(--indigo-600))]">
          Lens
        </span>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Token Auditor Button - only in results state */}
        {viewState === 'results' && (
          <button
            type="button"
            onClick={() => setIsTokenAuditorOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-bg-elevated))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
          >
            <Palette className="w-4 h-4" aria-hidden="true" />
            <span>Audit Design Tokens</span>
          </button>
        )}

        {/* Audited URL Badge - only in results state */}
        {viewState === 'results' && auditedUrl && (
          <div className="hidden md:flex items-center px-3 py-1.5 bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-md">
            <span className="text-sm text-[hsl(var(--color-text-secondary))] truncate max-w-[200px]">
              {auditedUrl}
            </span>
          </div>
        )}

        {/* New Scan Button */}
        <button
          type="button"
          onClick={onNewScan}
          disabled={isNewScanDisabled}
          aria-disabled={isNewScanDisabled}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] ${
            isNewScanDisabled
              ? 'text-[hsl(var(--color-text-disabled))] cursor-not-allowed'
              : 'text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-bg-elevated))]'
          }`}
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>New Scan</span>
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={isDark}
          className="p-2 rounded-md text-[hsl(var(--color-text-secondary))] hover:bg-[hsl(var(--color-bg-elevated))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
        >
          {isDark ? (
            <Sun className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Moon className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Token Auditor Modal */}
      <TokenAuditorModal
        isOpen={isTokenAuditorOpen}
        onClose={() => setIsTokenAuditorOpen(false)}
      />
    </header>
  );
}
