import { useState } from 'react';
import { Loader2, Sparkles, Lock, FileCode, Upload } from 'lucide-react';
import type { InputMode, AuditInput } from '@/types/audit.types';
import { ModeToggleTabs } from './ModeToggleTabs';
import { QuickFillChips } from './QuickFillChips';
import { HeroStatStrip } from './HeroStatStrip';

const HTML_QUICK_FILLS = [
  {
    label: 'Low Contrast Card',
    html: '<main><section class="card"><h1>Checkout</h1><p style="color:#9ca3af;background:#f3f4f6">Muted text on light gray background.</p><button>Pay now</button></section></main>',
  },
  {
    label: 'Missing Form Labels',
    html: '<form><input type="email" placeholder="Email" /><input type="password" placeholder="Password" /><button type="submit">Sign in</button></form>',
  },
  {
    label: 'Image Without Alt',
    html: '<article><h2>Product Spotlight</h2><img src="/sample-product.jpg"><p>Learn more about this product.</p></article>',
  },
];

interface InputPanelProps {
  onAnalyze: (input: AuditInput) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function InputPanel({ onAnalyze, isLoading, disabled }: InputPanelProps) {
  const [inputMode, setInputMode] = useState<InputMode>('url');
  const [urlValue, setUrlValue] = useState('');
  const [htmlValue, setHtmlValue] = useState('');
  const [cssValue, setCssValue] = useState('');
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

  const handleHtmlQuickFill = (html: string) => {
    setHtmlValue(html);
    setError(null);
  };

  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isHtmlLike = /\.html?$|\.xhtml$/i.test(file.name) || file.type.includes('html');
    if (!isHtmlLike) {
      setError('Please upload an HTML file (.html or .htm).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setHtmlValue(reader.result);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Unable to read the uploaded HTML file. Please try another file.');
    };
    reader.readAsText(file);

    e.currentTarget.value = '';
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
    } else if (inputMode === 'html') {
      const trimmedHtml = htmlValue.trim();
      if (!trimmedHtml) {
        setError('Please enter HTML content to analyze');
        return;
      }
      const trimmedCss = cssValue.trim();
      const input: AuditInput = trimmedCss
        ? { mode: 'html', value: trimmedHtml, css: trimmedCss }
        : { mode: 'html', value: trimmedHtml };
      onAnalyze(input);
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
        {inputMode === 'url' && (
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
        )}

        {inputMode === 'html' && (
          <div className="space-y-3" id="html-panel" role="tabpanel" aria-labelledby="html-tab">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="html-input" className="block text-sm font-medium text-[hsl(var(--color-text-primary))]">
                  HTML Snippet
                </label>

                <label
                  htmlFor="html-file-input"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[hsl(var(--color-text-primary))] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-md hover:bg-[hsl(var(--color-bg-base))] cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  Upload HTML File
                </label>
                <input
                  id="html-file-input"
                  type="file"
                  accept=".html,.htm,.xhtml,text/html,application/xhtml+xml"
                  className="sr-only"
                  onChange={handleHtmlFileUpload}
                  disabled={isLoading || disabled}
                />
              </div>
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

            {/* CSS Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="css-input" className="block text-sm font-medium text-[hsl(var(--color-text-secondary))]">
                  <span className="flex items-center gap-1.5">
                    <FileCode className="w-4 h-4" aria-hidden="true" />
                    CSS (Optional)
                  </span>
                </label>
                <span className="text-xs text-[hsl(var(--color-text-disabled))]">For contrast analysis</span>
              </div>
              <textarea
                id="css-input"
                value={cssValue}
                onChange={(e) => setCssValue(e.target.value)}
                disabled={isLoading || disabled}
                rows={4}
                placeholder="/* Paste CSS here to include in analysis (optional) */&#10;.my-class { color: #333; background: #fff; }"
                className="w-full px-4 py-3 bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-lg text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-disabled))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--indigo-400))] disabled:opacity-50 disabled:cursor-not-allowed font-mono resize-y text-sm"
              />
              <p className="text-xs text-[hsl(var(--color-text-secondary))]">
                Tip: External stylesheets (&lt;link&gt;) cannot be loaded. Paste your CSS here for accurate color contrast checks.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-[hsl(var(--color-text-secondary))]">Try sample HTML snippets:</p>
              <div className="flex flex-wrap gap-2">
                {HTML_QUICK_FILLS.map(({ label, html }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleHtmlQuickFill(html)}
                    disabled={isLoading || disabled}
                    className="px-3 py-1.5 text-xs text-[hsl(var(--color-text-secondary))] bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-full hover:bg-[hsl(var(--color-bg-elevated))] hover:text-[hsl(var(--color-text-primary))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {inputMode === 'alt-text' && (
          <div 
            id="alt-text-panel" 
            role="tabpanel" 
            aria-labelledby="alt-text-tab"
            className="p-8 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-lg text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-full">
              <Lock className="w-5 h-5 text-[hsl(var(--color-text-secondary))]" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-medium text-[hsl(var(--color-text-primary))] mb-2">
              AI-Powered Alt-Text Quality Review
            </h3>
            <p className="text-sm text-[hsl(var(--color-text-secondary))] max-w-md mx-auto mb-4">
              Coming soon: Upload images and get AI-powered alt-text quality assessments. 
              Evaluate descriptive accuracy, context relevance, and WCAG compliance for your image accessibility.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[hsl(var(--color-text-secondary))] bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-full">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Planned for v2.1
            </div>
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

        {/* Analyze Button - hidden for alt-text mode */}
        {inputMode !== 'alt-text' && (
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
        )}
      </div>

      {/* Quick Fill Chips - hidden for alt-text mode */}
      {inputMode !== 'alt-text' && (
        <QuickFillChips onSelect={handleQuickFill} disabled={isLoading || disabled} />
      )}

      {/* Hero Stats */}
      <HeroStatStrip />
    </div>
  );
}
