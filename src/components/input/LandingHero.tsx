import { ChevronDown, ShieldCheck, Eye, Sparkles, ScanSearch } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    label: 'WCAG 2.2 A / AA / AAA',
    description: 'Full criterion coverage across all three conformance levels',
  },
  {
    icon: Eye,
    label: 'Live preview with violation highlights',
    description: 'See exactly which elements fail, highlighted directly on the page',
  },
  {
    icon: ScanSearch,
    label: 'Vision impairment simulation',
    description: 'Preview your page through colour blindness, macular degeneration, and more',
  },
  {
    icon: Sparkles,
    label: 'Copy-ready AI fix prompts',
    description: 'One-click prompts you can paste straight into any AI assistant',
  },
];

function AccessibilityIllustration() {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Browser chrome */}
      <rect x="12" y="28" width="164" height="120" rx="10" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      {/* Browser toolbar */}
      <line x1="12" y1="52" x2="176" y2="52" stroke="currentColor" strokeWidth="5" strokeOpacity="0.35" />
      {/* Traffic dots */}
      <circle cx="30" cy="40" r="4" fill="currentColor" fillOpacity="0.3" />
      <circle cx="44" cy="40" r="4" fill="currentColor" fillOpacity="0.3" />
      <circle cx="58" cy="40" r="4" fill="currentColor" fillOpacity="0.3" />
      {/* URL bar placeholder */}
      <rect x="72" y="34" width="88" height="12" rx="6" fill="currentColor" fillOpacity="0.12" />

      {/* Page content lines */}
      <rect x="26" y="64" width="60" height="7" rx="3.5" fill="currentColor" fillOpacity="0.2" />
      <rect x="26" y="78" width="120" height="5" rx="2.5" fill="currentColor" fillOpacity="0.12" />
      <rect x="26" y="90" width="100" height="5" rx="2.5" fill="currentColor" fillOpacity="0.12" />
      <rect x="26" y="102" width="110" height="5" rx="2.5" fill="currentColor" fillOpacity="0.12" />

      {/* Violation highlight box */}
      <rect x="24" y="61" width="64" height="16" rx="4" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 3" strokeOpacity="0.8" />

      {/* Magnifying glass */}
      <circle cx="174" cy="122" r="38" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeWidth="5.5" />
      <circle cx="174" cy="122" r="22" fill="currentColor" fillOpacity="0.1" />
      {/* Mag glass handle */}
      <line x1="204" y1="152" x2="224" y2="172" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />

      {/* Check inside magnifier */}
      <polyline points="163,122 171,130 188,112" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />

      {/* Small floating badges */}
      {/* Badge 1: AA */}
      <rect x="6" y="160" width="44" height="22" rx="11" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
      <text x="28" y="175" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor" fillOpacity="0.7">AA</text>

      {/* Badge 2: check */}
      <rect x="60" y="168" width="32" height="22" rx="11" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
      <polyline points="69,179 74,184 83,173" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.75" />

      {/* Badge 3: eye */}
      <rect x="104" y="176" width="32" height="22" rx="11" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
      <ellipse cx="120" cy="187" rx="7" ry="4.5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.7" />
      <circle cx="120" cy="187" r="2" fill="currentColor" fillOpacity="0.6" />

      {/* Subtle grid dots in background */}
      {[40, 60, 80, 100, 120, 140, 160, 180, 200, 220].map(x =>
        [20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220].map(y => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.2" fill="currentColor" fillOpacity="0.06" />
        ))
      )}
    </svg>
  );
}

export function LandingHero() {
  const handleScrollToForm = () => {
    const form = document.getElementById('main-input');
    if (!form) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    form.scrollIntoView({ behavior: prefersReducedMotion ? 'instant' : 'smooth', block: 'start' });
    form.focus({ preventScroll: true });
  };

  return (
    <header className="w-full max-w-4xl mx-auto pb-6">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_320px] gap-8 sm:gap-16 items-center">

        {/* Left — text content */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[hsl(var(--color-text-primary))] leading-tight">
              Find Accessibility Barriers<br className="hidden sm:block" /> Before Your Users Do
            </h1>
            <p className="text-base text-[hsl(var(--color-text-secondary))] leading-relaxed max-w-lg">
              AccessLens audits any webpage or HTML snippet against WCAG&nbsp;2.2, highlights
              violations in a live preview, and gives you copy-ready fix prompts — all in the
              browser, no server required.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3" aria-label="Key features">
            {features.map(({ icon: Icon, label, description }) => (
              <li key={label} className="flex items-start gap-3">
                <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[hsl(var(--indigo-100))] dark:bg-[hsl(var(--indigo-950))] border border-[hsl(var(--indigo-200))] dark:border-[hsl(var(--indigo-800))]">
                  <Icon className="w-3.5 h-3.5 text-[hsl(var(--indigo-600))] dark:text-[hsl(var(--indigo-400))]" aria-hidden="true" />
                </span>
                <div>
                  <span className="text-sm font-medium text-[hsl(var(--color-text-primary))]">{label}</span>
                  <p className="text-xs text-[hsl(var(--color-text-secondary))] mt-0.5 leading-relaxed">{description}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            type="button"
            onClick={handleScrollToForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[hsl(var(--indigo-600))] text-[hsl(var(--slate-50))] rounded-lg hover:bg-[hsl(var(--indigo-700))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
            aria-label="Scroll down to scan form"
          >
            Scan a page
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Right — decorative illustration */}
        <div
          className="hidden sm:flex items-center justify-center text-[hsl(var(--indigo-500))] dark:text-[hsl(var(--indigo-400))] opacity-80"
          aria-hidden="true"
        >
          <AccessibilityIllustration />
        </div>
      </div>
    </header>
  );
}
