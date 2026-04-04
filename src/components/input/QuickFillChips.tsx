interface QuickFillChipsProps {
  onSelect: (url: string) => void;
  disabled?: boolean | undefined;
}

const QUICK_FILLS = [
  { label: 'Enterprise Dashboard', url: 'demo.accesslens.app/dashboard' },
  { label: 'E-commerce Checkout', url: 'demo.accesslens.app/ecommerce' },
  { label: 'Healthcare Portal', url: 'demo.accesslens.app/healthcare' },
];

export function QuickFillChips({ onSelect, disabled }: QuickFillChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_FILLS.map(({ label, url }) => (
        <button
          key={url}
          type="button"
          onClick={() => onSelect(url)}
          disabled={disabled}
          className="px-3 py-1.5 text-sm text-[hsl(var(--color-text-secondary))] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-full hover:bg-[hsl(var(--color-bg-elevated))] hover:text-[hsl(var(--color-text-primary))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
