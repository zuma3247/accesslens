import { useAudit } from '@/hooks/useAudit';
import { useTheme } from '@/hooks/useTheme';
import { TopNav } from '@/components/layout/TopNav';
import { InputPanel } from '@/components/input/InputPanel';
import { ResultsDashboard } from '@/components/layout/ResultsDashboard';
import { SVGFilterDefs } from '@/components/emulation/SVGFilterDefs';
import { EmulationWidget } from '@/components/emulation/EmulationWidget';
import { EmulationProvider } from '@/context/EmulationContext';

function App() {
  const { theme } = useTheme();
  const { viewState, auditResult, heatmapGrid, runAudit, reset } = useAudit();

  return (
    <EmulationProvider>
      <div className="min-h-screen bg-[hsl(var(--color-bg-base))] text-[hsl(var(--color-text-primary))]" data-theme={theme}>
        {/* SVG Filter Definitions - injected via portal */}
        <SVGFilterDefs />

        {/* Top Navigation */}
        <TopNav
          viewState={viewState}
          auditedUrl={auditResult?.auditedInput}
          onNewScan={reset}
        />

        {/* Main Content Area */}
        <main id="app-root" className="relative">
          {viewState === 'idle' && (
            <div className="px-6 py-12">
              <InputPanel
                onAnalyze={runAudit}
                isLoading={false}
                disabled={false}
              />
            </div>
          )}

          {viewState === 'loading' && (
            <div className="px-6 py-12 opacity-50 pointer-events-none">
              <InputPanel
                onAnalyze={runAudit}
                isLoading={true}
                disabled={true}
              />
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
