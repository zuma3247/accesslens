import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Download, AlertCircle, Check, Info } from 'lucide-react';
import type { ContrastResult, ContrastMatrix } from '@/lib/contrastUtils';
import {
  buildContrastMatrix,
  generateCorrectedTokens,
} from '@/lib/contrastUtils';

interface TokenAuditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_TOKENS = `:root {
  --color-text-primary: #1a1a2e;
  --color-text-secondary: #6b7280;
  --color-bg-base: #ffffff;
  --color-bg-surface: #f9fafb;
  --color-interactive: #6366f1;
  --color-error: #ef4444;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
}`;

export function TokenAuditorModal({ isOpen, onClose }: TokenAuditorModalProps) {
  const [input, setInput] = useState('');
  const [matrix, setMatrix] = useState<ContrastMatrix | null>(null);
  const [showFailingOnly, setShowFailingOnly] = useState(true);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus trap helper
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    const focusable = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    return Array.from(focusable) as HTMLElement[];
  }, []);

  // Handle tab key for focus trap
  const handleTabKey = useCallback((e: KeyboardEvent) => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [getFocusableElements]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      } else if (e.key === 'Tab' && isOpen) {
        handleTabKey(e);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus textarea when modal opens
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleTabKey]);

  const handleAnalyze = useCallback(() => {
    const newMatrix = buildContrastMatrix(input);
    setMatrix(newMatrix);

    // Collect parse errors
    const errors: string[] = [];
    const tokens = input.match(/--[\w-]+\s*:\s*([^;]+);/g) || [];
    for (const token of tokens) {
      const valueMatch = token.match(/:\s*([^;]+);/);
      if (valueMatch) {
        const value = valueMatch[1].trim();
        if (!/^#[0-9a-fA-F]{3,6}$/.test(value)) {
          const nameMatch = token.match(/(--[\w-]+)/);
          if (nameMatch) {
            errors.push(`Token ${nameMatch[1]} uses a non-hex value and was skipped. Convert to hex for full analysis.`);
          }
        }
      }
    }
    setParseErrors(errors);
  }, [input]);

  const handleDownload = useCallback(() => {
    if (!matrix) return;

    const corrected = generateCorrectedTokens(input, matrix);
    const blob = new Blob([corrected], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tokens-fixed.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [input, matrix]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleFillSample = () => {
    setInput(SAMPLE_TOKENS);
    setMatrix(null);
    setParseErrors([]);
  };

  const getCellColorClass = (result: ContrastResult | undefined) => {
    if (!result) return 'bg-[hsl(var(--color-bg-surface))]';
    if (result.aaText) return 'bg-[hsl(var(--color-success-bg))]';
    if (result.aaLarge || result.aaUI) return 'bg-[hsl(var(--color-warning-bg))]';
    return 'bg-[hsl(var(--color-error-bg))]';
  };

  const getCellTextClass = (result: ContrastResult | undefined) => {
    if (!result) return 'text-[hsl(var(--color-text-secondary))]';
    if (result.aaText) return 'text-[hsl(var(--color-success-text))]';
    if (result.aaLarge || result.aaUI) return 'text-[hsl(var(--color-warning-text))]';
    return 'text-[hsl(var(--color-error-text))]';
  };

  const getCellContent = (result: ContrastResult | undefined) => {
    if (!result) return '—';
    if (result.tokenA === result.tokenB) return '—';

    const badges = [];
    if (result.aaText) badges.push('AA ✓');
    else if (result.aaLarge) badges.push('AA Lg ✓');
    else badges.push('Fail');

    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-medium text-xs">{result.ratio}:1</span>
        <span className="text-[10px]">{badges.join(' · ')}</span>
      </div>
    );
  };

  const getCellAriaLabel = (tokenA: string, tokenB: string, result: ContrastResult | undefined) => {
    if (!result || tokenA === tokenB) {
      return `${tokenA} vs ${tokenB}: same color`;
    }
    const status = result.aaText
      ? 'passes WCAG AA text contrast'
      : result.aaLarge
        ? 'passes AA large text only'
        : 'fails WCAG AA';
    return `${tokenA} vs ${tokenB}: contrast ratio ${result.ratio} to 1, ${status}`;
  };

  const visibleTokens = matrix?.tokens || [];
  const visiblePairs = matrix?.pairs || [];

  // Filter to show failing only if enabled
  const displayPairs = showFailingOnly
    ? visiblePairs.filter(p => !p.aaText)
    : visiblePairs;

  const hasFailingPairs = (matrix?.failingCount || 0) > 0;

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-auditor-title"
    >
      <div className="w-full max-w-4xl max-h-[90vh] bg-[hsl(var(--color-bg-elevated))] rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--color-border))] flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 id="token-auditor-title" className="text-lg font-semibold text-[hsl(var(--color-text-primary))]">
              Design Token Contrast Auditor
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-bg-surface))] rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
            aria-label="Close token auditor"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Input Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="token-input" className="text-sm font-medium text-[hsl(var(--color-text-primary))]">
                Paste your CSS custom properties
              </label>
              <button
                type="button"
                onClick={handleFillSample}
                className="text-xs text-[hsl(var(--indigo-600))] hover:text-[hsl(var(--indigo-700))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] rounded px-2 py-1"
              >
                Fill with sample tokens
              </button>
            </div>
            <textarea
              ref={textareaRef}
              id="token-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
              placeholder={`:root {
  --color-text-primary: #1a1a2e;
  --color-text-secondary: #6b7280;
  --color-bg-base: #ffffff;
  /* Paste more tokens... */
}`}
              className="w-full px-4 py-3 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-lg text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-disabled))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--indigo-400))] font-mono text-sm resize-y"
              aria-describedby={parseErrors.length > 0 ? 'token-parse-errors' : undefined}
            />

            {/* Parse Errors */}
            {parseErrors.length > 0 && (
              <div
                id="token-parse-errors"
                role="alert"
                className="space-y-1"
              >
                {parseErrors.map((error, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-sm text-[hsl(var(--color-warning-text))]"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!input.trim()}
              className="px-4 py-2 bg-[hsl(var(--indigo-600))] text-[hsl(var(--slate-50))] font-medium rounded-lg hover:bg-[hsl(var(--indigo-700))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze Contrast
            </button>
          </div>

          {/* Results Section */}
          {matrix && visibleTokens.length > 0 && (
            <div className="space-y-4 border-t border-[hsl(var(--color-border))] pt-6">
              {/* Summary */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-[hsl(var(--color-bg-surface))] rounded-lg">
                  <Info className="w-4 h-4 text-[hsl(var(--color-text-secondary))]" aria-hidden="true" />
                  <span className="text-sm text-[hsl(var(--color-text-secondary))]">
                    {matrix.failingCount} of {matrix.totalCount} pairs fail WCAG AA text contrast
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Filter Toggle */}
                  <label className="flex items-center gap-2 text-sm text-[hsl(var(--color-text-secondary))] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFailingOnly}
                      onChange={(e) => setShowFailingOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-[hsl(var(--color-border))] text-[hsl(var(--indigo-600))] focus:ring-[hsl(var(--indigo-400))]"
                      role="switch"
                      aria-checked={showFailingOnly}
                    />
                    Show failing pairs only
                  </label>

                  {/* Download Button */}
                  {hasFailingPairs && (
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[hsl(var(--indigo-600))] hover:text-[hsl(var(--indigo-700))] bg-[hsl(var(--indigo-50))] dark:bg-[hsl(var(--indigo-900))] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
                      aria-describedby="download-description"
                    >
                      <Download className="w-4 h-4" aria-hidden="true" />
                      Download Fixed Tokens
                    </button>
                  )}
                </div>
              </div>

              <p id="download-description" className="sr-only">
                Downloads a CSS file with auto-corrected hex values for failing color pairs
              </p>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs text-[hsl(var(--color-text-secondary))]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[hsl(var(--color-success-bg))] border border-[hsl(var(--color-success-border))]" />
                  <span>AA Text ✓ (4.5:1+)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[hsl(var(--color-warning-bg))] border border-[hsl(var(--color-warning-border))]" />
                  <span>AA Large/UI Only (3:1+)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[hsl(var(--color-error-bg))] border border-[hsl(var(--color-error-border))]" />
                  <span>Fail (&lt;3:1)</span>
                </div>
              </div>

              {/* Contrast Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <caption className="sr-only">
                    Contrast ratio matrix for all color token pairs. Each cell shows the contrast ratio and WCAG compliance status.
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" className="sr-only">Token</th>
                      {visibleTokens.map(token => (
                        <th
                          key={token.name}
                          scope="col"
                          className="px-2 py-2 text-xs font-medium text-[hsl(var(--color-text-secondary))] text-center min-w-[80px]"
                        >
                          <div className="max-w-[100px] truncate" title={token.name}>
                            {token.name.replace('--color-', '')}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleTokens.map((rowToken) => (
                      <tr key={rowToken.name}>
                        <th
                          scope="row"
                          className="px-2 py-2 text-xs font-medium text-[hsl(var(--color-text-secondary))] text-left sticky left-0 bg-[hsl(var(--color-bg-elevated))]"
                        >
                          <div className="max-w-[120px] truncate" title={rowToken.name}>
                            {rowToken.name}
                          </div>
                          <span className="text-[10px] text-[hsl(var(--color-text-disabled))] font-mono">
                            {rowToken.value}
                          </span>
                        </th>
                        {visibleTokens.map((colToken) => {
                          const result = visiblePairs.find(
                            p => p.tokenA === rowToken.name && p.tokenB === colToken.name
                          );

                          // Dim cell if failing-only filter is on and this passes
                          const isHiddenByFilter = showFailingOnly && result?.aaText;

                          return (
                            <td
                              key={`${rowToken.name}-${colToken.name}`}
                              className={`px-1 py-1 text-center min-w-[70px] ${isHiddenByFilter ? 'bg-[hsl(var(--color-bg-surface))]' : getCellColorClass(result)} border border-[hsl(var(--color-border))]`}
                              aria-label={isHiddenByFilter ? `${rowToken.name} vs ${colToken.name}: passes, hidden by filter` : getCellAriaLabel(rowToken.name, colToken.name, result)}
                            >
                              {!isHiddenByFilter && (
                                <div className={`text-xs ${getCellTextClass(result)}`}>
                                  {getCellContent(result)}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {displayPairs.length === 0 && showFailingOnly && (
                <div className="text-center py-8 text-[hsl(var(--color-text-secondary))]">
                  <Check className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--color-success))]" aria-hidden="true" />
                  <p>All color pairs pass WCAG AA text contrast! No failing pairs to display.</p>
                </div>
              )}
            </div>
          )}

          {/* No Valid Tokens State */}
          {matrix && visibleTokens.length === 0 && (
            <div className="text-center py-8 border-t border-[hsl(var(--color-border))]">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[hsl(var(--color-warning))]" aria-hidden="true" />
              <p className="text-[hsl(var(--color-text-secondary))]">
                No valid hex color tokens found. Make sure your CSS uses hex values like #ffffff or #fff.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
