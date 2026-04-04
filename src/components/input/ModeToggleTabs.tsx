import type { InputMode } from '@/types/audit.types';

interface ModeToggleTabsProps {
  mode: InputMode;
  onChange: (mode: InputMode) => void;
}

export function ModeToggleTabs({ mode, onChange }: ModeToggleTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Input mode"
      className="flex p-1 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-lg"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'url'}
        aria-controls="url-panel"
        id="url-tab"
        onClick={() => onChange('url')}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] ${
          mode === 'url'
            ? 'bg-[hsl(var(--indigo-600))] text-[hsl(var(--slate-50))]'
            : 'text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))]'
        }`}
      >
        URL
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'html'}
        aria-controls="html-panel"
        id="html-tab"
        onClick={() => onChange('html')}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] ${
          mode === 'html'
            ? 'bg-[hsl(var(--indigo-600))] text-[hsl(var(--slate-50))]'
            : 'text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))]'
        }`}
      >
        HTML Snippet
      </button>
    </div>
  );
}
