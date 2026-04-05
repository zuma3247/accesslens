import { useAudit } from '@/hooks/useAudit';
import { useTheme } from '@/hooks/useTheme';
import { TopNav } from '@/components/layout/TopNav';
import { InputPanel } from '@/components/input/InputPanel';
import { ResultsDashboard } from '@/components/layout/ResultsDashboard';
import { SkeletonDashboard } from '@/components/skeleton/SkeletonDashboard';
import { SVGFilterDefs } from '@/components/emulation/SVGFilterDefs';
import { EmulationWidget } from '@/components/emulation/EmulationWidget';
import { EmulationProvider } from '@/context/EmulationContext';

function App() {
  const { theme } = useTheme();
  const { viewState, auditResult, heatmapGrid, error, runAudit, reset } = useAudit();

  const handleSkipToMain = () => {
    const mainContent = document.getElementById('app-root');
    mainContent?.focus();
  };

  return (
    <EmulationProvider>
      <div className="min-h-screen bg-[hsl(var(--color-bg-base))] text-[hsl(var(--color-text-primary))]" data-theme={theme}>
        {/* SVG Filter Definitions - injected via portal */}
        <SVGFilterDefs />

        {/* Skip to main content link */}
        <a
          href="#app-root"
          onClick={handleSkipToMain}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[hsl(var(--color-bg-elevated))] focus:border focus:border-[hsl(var(--indigo-400))] focus:rounded-md focus:text-[hsl(var(--color-text-primary))] focus:font-medium focus:shadow-lg"
        >
          Skip to main content
        </a>

        {/* Top Navigation */}
        <TopNav
          viewState={viewState}
          auditedUrl={auditResult?.auditedInput}
          onNewScan={reset}
        />

        {/* Main Content Area */}
        <main id="app-root" tabIndex={-1} className="relative" role="main" aria-label="Accessibility audit results">
          {(viewState === 'idle' || viewState === 'loading') && (
            <div className="px-6 py-12 space-y-8">
              {error && (
                <div
                  className="max-w-2xl mx-auto rounded-lg border border-[hsl(var(--color-error))] bg-[hsl(var(--color-bg-surface))] p-4"
                  role="alert"
                  aria-live="assertive"
                >
                  <p className="text-sm font-medium text-[hsl(var(--color-error))] mb-3">{error}</p>
                  <button
                    type="button"
                    onClick={reset}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-[hsl(var(--indigo-600))] text-[hsl(var(--slate-50))] hover:bg-[hsl(var(--indigo-700))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
                  >
                    Try Again
                  </button>
                </div>
              )}

              <InputPanel
                onAnalyze={runAudit}
                isLoading={viewState === 'loading'}
                disabled={viewState === 'loading'}
              />

              {viewState === 'loading' && <SkeletonDashboard />}
            </div>
          )}

          {viewState === 'results' && auditResult && heatmapGrid && (
            <div className="px-6 py-8">
              <ResultsDashboard payload={auditResult} heatmapGrid={heatmapGrid} />
            </div>
          )}
        </main>

        {/* Emulation Widget - outside #app-root so it's never filtered */}
        <EmulationWidget />
      </div>
    </EmulationProvider>
  );
}

export default App;
