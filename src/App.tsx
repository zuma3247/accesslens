import { useTheme } from './hooks/useTheme';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      id="app-root"
      className="min-h-screen bg-[var(--color-bg-base)] px-8 py-12 text-[var(--color-text-primary)]"
    >
      <div className="mx-auto max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          AccessLens
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          App shell ready for Phase 2
        </p>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 shadow-md">
          <p className="mb-2 text-sm text-[var(--color-text-secondary)]">
            Current theme: <strong>{theme}</strong>
          </p>
          <button
            onClick={toggleTheme}
            className="rounded-md bg-[var(--color-interactive)] px-4 py-2 text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--color-interactive-hover)]"
          >
            Toggle Theme
          </button>
        </div>

        <div className="text-xs text-[var(--color-text-secondary)]">
          <p>✓ Design tokens loaded</p>
          <p>✓ TypeScript strict mode enabled</p>
          <p>✓ ThemeContext initialized</p>
        </div>
      </div>
    </div>
  );
}

export default App;
