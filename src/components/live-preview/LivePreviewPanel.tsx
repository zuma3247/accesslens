import { useMemo, useState } from 'react';
import type { Issue } from '@/types/audit.types';

interface LivePreviewPanelProps {
  htmlContent: string;
  issues: Issue[];
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  isUrlContent?: boolean; // Whether this content is from a URL (needs different sandbox)
}

function sanitizeHtmlForPreview(html: string): string {
  const withoutScriptsOrInlineHandlers = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '');

  return withoutScriptsOrInlineHandlers.replace(
    /\s(href|src|xlink:href|formaction|action)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,
    (fullMatch, attrName: string, rawValue: string) => {
      const unquotedValue = rawValue.replace(/^['"]|['"]$/g, '');
      const normalizedValue = Array.from(unquotedValue)
        .filter((char) => {
          const code = char.charCodeAt(0);
          return code > 31 && code !== 127 && !/\s/.test(char);
        })
        .join('')
        .toLowerCase();
      const isDangerousScheme =
        normalizedValue.startsWith('javascript:') ||
        normalizedValue.startsWith('vbscript:') ||
        normalizedValue.startsWith('data:text/html');

      if (!isDangerousScheme) {
        return fullMatch;
      }

      return ` ${attrName}="#"`;
    },
  );
}

// Extract a CSS selector from an HTML code snippet
function extractSelectorFromCodeSnippet(snippet: string): string {
  const idMatch = snippet.match(/id=["']([^"']+)["']/);
  if (idMatch) return `#${CSS.escape(idMatch[1])}`;

  const classMatch = snippet.match(/class=["']([^"']+)["']/);
  if (classMatch) {
    const classes = classMatch[1].split(/\s+/).filter(Boolean);
    if (classes.length > 0) {
      return classes.map(c => `.${CSS.escape(c)}`).join('');
    }
  }

  const tagMatch = snippet.match(/<([a-zA-Z][a-zA-Z0-9]*)/);
  if (tagMatch) return tagMatch[1];

  return '';
}

// Escape a string for safe use inside a CSS content or attribute value
function escapeCssString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\a ');
}

// Build CSS-only highlight rules from issues — no JS needed in the iframe
function buildHighlightCss(issues: Issue[]): string {
  const severityColors: Record<string, { border: string; bg: string }> = {
    critical: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    serious: { border: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
    moderate: { border: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' },
    minor: { border: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' },
  };
  const severityRank: Record<string, number> = {
    critical: 4,
    serious: 3,
    moderate: 2,
    minor: 1,
  };

  const rules: string[] = [];
  const selectorIssues = new Map<string, Issue[]>();

  for (const issue of issues) {
    const selector = extractSelectorFromCodeSnippet(issue.codeSnippet);

    if (!selector) {
      continue;
    }

    const existingIssues = selectorIssues.get(selector) ?? [];
    existingIssues.push(issue);
    selectorIssues.set(selector, existingIssues);
  }

  for (const [selector, matchedIssues] of selectorIssues) {
    const highestSeverityIssue = matchedIssues.reduce((highest, current) => {
      return severityRank[current.severity] > severityRank[highest.severity] ? current : highest;
    }, matchedIssues[0]);

    const colors = severityColors[highestSeverityIssue.severity] || severityColors.minor;
    const description = escapeCssString(
      matchedIssues
        .map((issue) => `${issue.wcagCriterion}: ${issue.description}`)
        .filter((value, index, values) => values.indexOf(value) === index)
        .join('\n')
    );

    rules.push(`
      ${selector} {
        outline: 2px dashed ${colors.border} !important;
        outline-offset: 2px !important;
        position: relative !important;
      }
      ${selector}:hover {
        background-color: ${colors.bg} !important;
      }
      ${selector}:hover::after {
        content: '${description}';
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #1f2937;
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-family: system-ui, sans-serif;
        white-space: pre-wrap;
        max-width: 300px;
        margin-bottom: 8px;
        z-index: 10000;
        pointer-events: none;
      }
    `);
  }

  return rules.join('\n');
}

// Generate the iframe HTML with CSS-only highlights (no scripts).
// For URL content (which already has <html>/<head>/<body>), inject the highlight
// <style> into the existing <head> to preserve <base>, <link>, and <meta> tags.
function generateIframeContent(html: string, issues: Issue[], showHighlights: boolean): string {
  const safeHtml = sanitizeHtmlForPreview(html);
  const highlightCss = showHighlights ? buildHighlightCss(issues) : '';
  const styleTag = `<style data-accesslens-highlights>${highlightCss}</style>`;

  // Inject into existing <head> — preserves <base>, <link>, <meta viewport>, etc.
  if (/<head(\s[^>]*)?>/i.test(safeHtml)) {
    return safeHtml.replace(/<head(\s[^>]*)?>/i, `$&\n${styleTag}`);
  }

  // Fallback for HTML snippets without <head>
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${styleTag}</head><body>${safeHtml}</body></html>`;
}

export function LivePreviewPanel({
  htmlContent,
  issues,
  isCollapsed,
  onToggleCollapsed,
  isUrlContent = false,
}: LivePreviewPanelProps) {
  const [showHighlights, setShowHighlights] = useState(true);

  // Generate iframe srcdoc — memoized to avoid recompute on every render
  const iframeContent = useMemo(
    () => generateIframeContent(htmlContent, issues, showHighlights),
    [htmlContent, issues, showHighlights],
  );

  const severityCounts = useMemo(
    () => ({
      critical: issues.filter((i) => i.severity === 'critical').length,
      serious: issues.filter((i) => i.severity === 'serious').length,
      moderate: issues.filter((i) => i.severity === 'moderate').length,
      minor: issues.filter((i) => i.severity === 'minor').length,
    }),
    [issues],
  );

  return (
    <section className="bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--color-border))]">
        <div>
          <h2 id="live-preview-title" className="text-sm font-semibold uppercase tracking-[0.08em] text-[hsl(var(--color-text-secondary))]">
            Live Preview{showHighlights ? ' with Violation Highlights' : ''}
          </h2>
          <p className="text-sm text-[hsl(var(--color-text-secondary))] mt-1">
            {showHighlights
              ? 'Hover highlighted elements to inspect the linked WCAG issue.'
              : 'Showing the page as it appears in a browser.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setShowHighlights((prev) => !prev)}
              className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))] ${
                showHighlights
                  ? 'text-white bg-[hsl(var(--indigo-500))] border-[hsl(var(--indigo-500))] hover:bg-[hsl(var(--indigo-600))]'
                  : 'text-[hsl(var(--color-text-primary))] bg-[hsl(var(--color-bg-elevated))] border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-bg-base))]'
              }`}
              aria-pressed={showHighlights}
            >
              {showHighlights ? 'Hide Highlights' : 'Show Highlights'}
            </button>
          )}
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="px-3 py-1.5 text-sm font-medium text-[hsl(var(--color-text-primary))] bg-[hsl(var(--color-bg-elevated))] border border-[hsl(var(--color-border))] rounded-md hover:bg-[hsl(var(--color-bg-base))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
            aria-expanded={!isCollapsed}
            aria-controls="live-preview-content"
          >
            {isCollapsed ? 'Show Preview' : 'Hide Preview'}
          </button>
        </div>
      </div>

      {showHighlights && (
        <div className="px-6 py-3 border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))]">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-medium text-[hsl(var(--color-text-secondary))]">Violations:</span>
            <span className="px-2 py-1 rounded-full border border-[#ef4444] text-[#ef4444]">Critical {severityCounts.critical}</span>
            <span className="px-2 py-1 rounded-full border border-[#f97316] text-[#f97316]">Serious {severityCounts.serious}</span>
            <span className="px-2 py-1 rounded-full border border-[#eab308] text-[#a16207]">Moderate {severityCounts.moderate}</span>
            <span className="px-2 py-1 rounded-full border border-[#6b7280] text-[hsl(var(--color-text-secondary))]">Minor {severityCounts.minor}</span>
          </div>
        </div>
      )}

      {!isCollapsed && (
        <>
          <div id="live-preview-content" className="h-[420px] lg:h-[520px] overflow-auto bg-white">
            <iframe
              srcDoc={iframeContent}
              className="w-full h-full border-0"
              title={showHighlights ? 'Live preview with accessibility violations highlighted' : 'Live preview of audited page'}
              sandbox={isUrlContent ? "allow-same-origin" : ""}
            />
          </div>

          {showHighlights && (
            <div className="flex items-center gap-6 px-6 py-3 border-t border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-surface))]">
              <span className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">Violation severity:</span>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 border-2 border-dashed border-[#ef4444] rounded" />
                  <span className="text-[hsl(var(--color-text-secondary))]">Critical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 border-2 border-dashed border-[#f97316] rounded" />
                  <span className="text-[hsl(var(--color-text-secondary))]">Serious</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 border-2 border-dashed border-[#eab308] rounded" />
                  <span className="text-[hsl(var(--color-text-secondary))]">Moderate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 border-2 border-dashed border-[#6b7280] rounded" />
                  <span className="text-[hsl(var(--color-text-secondary))]">Minor</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
