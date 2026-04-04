import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { InputMode, AuditInput } from '@/types/audit.types';
import { ModeToggleTabs } from './ModeToggleTabs';
import { QuickFillChips } from './QuickFillChips';
import { HeroStatStrip } from './HeroStatStrip';

interface InputPanelProps {
  onAnalyze: (input: AuditInput) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function InputPanel({ onAnalyze, isLoading, disabled }: InputPanelProps) {
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [urlValue, setUrlValue] = useState('');
  const [htmlValue, setHtmlValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
    setError(null);
  };

  const handleQuickFill = (url: string) => {
    setUrlValue(url);
    setError(null);
    onAnalyze({ mode: 'url', value: url });
  };

  const handleAnalyze = () => {
    setError(null);

    if (inputMode === 'url') {
      const trimmedUrl = urlValue.trim();
      if (!trimmedUrl) {
        setError('Please enter a valid URL (e.g., https://example.com)');
        return;
      }
      // Basic URL validation - accept with or without protocol
      const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/.*)?$/i;
      if (!urlPattern.test(trimmedUrl)) {
        setError('Please enter a valid URL (e.g., https://example.com)');
        return;
      }
      onAnalyze({ mode: 'url', value: trimmedUrl });
    } else {
      const trimmedHtml = htmlValue.trim();
      if (!trimmedHtml) {
        setError('Please enter HTML content to analyze');
        return;
      }
      onAnalyze({ mode: 'html', value: trimmedHtml });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputMode === 'url' && !isLoading && !disabled) {
      handleAnalyze();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Mode Toggle */}
      <ModeToggleTabs mode={inputMode} onChange={handleModeChange} />

      {/* Input Area */}
      <div className="space-y-3">
        {inputMode === 'url' ? (
          <div className="space-y-2" id="url-panel" role="tabpanel" aria-labelledby="url-tab">
            <label htmlFor="url-input" className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">
              Website URL
            </label>
            <input
              id="url-input"
              type="text"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || disabled}
              placeholder="https://example.com"
              aria-describedby={error ? 'input-error' : undefined}
              className={`w-full px-4 py-3 bg-[hsl(var(--color-bg-elevated))] border rounded-lg text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-disabled))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--indigo-400))] disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-[hsl(var(--color-error))]' : 'border-[hsl(var(--color-border))]'}`}
            />
          </div>
        ) : (
          <div className="space-y-2" id="html-panel" role="tabpanel" aria-labelledby="html-tab">
            <label htmlFor="html-input" className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">
              HTML Snippet
            </label>
            <textarea
              id="html-input"
              value={htmlValue}
              onChange={(e) => setHtmlValue(e.target.value)}
              disabled={isLoading || disabled}
              rows={6}
              placeholder="<!-- Paste any HTML fragment to audit it live -->"
              aria-describedby={error ? 'input-error' : undefined}
              className={`w-full px-4 py-3 bg-[hsl(var(--color-bg-elevated))] border rounded-lg text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-disabled))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--indigo-400))] disabled:opacity-50 disabled:cursor-not-allowed font-mono resize-y ${error ? 'border-[hsl(var(--color-error))]' : 'border-[hsl(var(--color-border))]'}`}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            id="input-error"
            role="alert"
            aria-live="assertive"
            className="text-sm text-[hsl(var(--color-error))]"
          >
            {error}
          </div>
        )}

        {/* Analyze Button */}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isLoading || disabled}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[hsl(var(--indigo-600))] text-[hsl(var(--slate-50))] font-medium rounded-lg hover:bg-[hsl(var(--indigo-700))] transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--indigo-400))] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Analyze</span>
          )}
        </button>
      </div>

      {/* Quick Fill Chips */}
      <QuickFillChips onSelect={handleQuickFill} disabled={isLoading || disabled} />

      {/* Hero Stats */}
      <HeroStatStrip />
    </div>
  );
}
