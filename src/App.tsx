import { useTheme } from './context/ThemeContext';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div id="app-root" className="min-h-screen p-8">
      <div className="max-w-md mx-auto text-center space-y-6">
        <h1 className="text-2xl font-semibold">AccessLens</h1>
        <p className="text-secondary">App shell ready for Phase 2</p>
        
        <div className="p-4 rounded-lg border border-[hsl(var(--slate-200))] bg-[hsl(var(--slate-100))]">
          <p className="text-sm mb-2">Current theme: <strong>{theme}</strong></p>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-md bg-[hsl(var(--indigo-600))] text-white hover:bg-[hsl(var(--indigo-700))] transition-colors"
          >
            Toggle Theme
          </button>
        </div>

        <div className="text-xs text-[hsl(var(--slate-500))]">
          <p>✓ Design tokens loaded</p>
          <p>✓ TypeScript strict mode enabled</p>
          <p>✓ ThemeContext initialized</p>
        </div>
      </div>
    </div>
  );
}

export default App;
