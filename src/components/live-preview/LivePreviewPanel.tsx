import { useEffect, useRef, useCallback, useMemo } from 'react';
import type { Issue } from '@/types/audit.types';

interface LivePreviewPanelProps {
  htmlContent: string;
  issues: Issue[];
  isOpen: boolean;
  onClose: () => void;
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
      const normalizedValue = unquotedValue.replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase();
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

  const rules: string[] = [];
  const seen = new Set<string>();

  for (const issue of issues) {
    const selector = extractSelectorFromCodeSnippet(issue.codeSnippet);
    if (!selector || seen.has(selector)) continue;
    seen.add(selector);

    const colors = severityColors[issue.severity] || severityColors.minor;
    const description = escapeCssString(`${issue.wcagCriterion}: ${issue.description}`);

    rules.push(`
      ${selector} {
        outline: 3px solid ${colors.border} !important;
        outline-offset: 2px !important;
        background-color: ${colors.bg} !important;
        position: relative !important;
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

// Generate the iframe HTML with CSS-only highlights (no scripts)
function generateIframeContent(html: string, issues: Issue[]): string {
  const safeHtml = sanitizeHtmlForPreview(html);
  const highlightCss = buildHighlightCss(issues);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { position: relative; margin: 0; }
    ${highlightCss}
  </style>
</head>
<body>
  ${safeHtml}
</body>
</html>`;
}

export function LivePreviewPanel({ htmlContent, issues, isOpen, onClose }: LivePreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Generate iframe srcdoc — memoized to avoid recompute on every render
  const iframeContent = useMemo(
    () => generateIframeContent(htmlContent, issues),
    [htmlContent, issues],
  );

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

  // Keyboard navigation — only active when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab') {
        handleTabKey(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Focus close button on open
    const timerId = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timerId);
    };
  }, [isOpen, onClose, handleTabKey]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-preview-title"
    >
      <div className="w-full max-w-5xl h-[80vh] bg-[hsl(var(--color-bg-elevated))] rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--color-border))] flex-shrink-0">
          <div>
            <h2 id="live-preview-title" className="text-lg font-semibold text-[hsl(var(--color-text-primary))]">
              Live Preview with Violation Highlights
            </h2>
            <p className="text-sm text-[hsl(var(--color-text-secondary))]">
              Hover over highlighted areas to see violation details
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-bg-surface))] rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--indigo-400))]"
            aria-label="Close live preview"
          >
            <span aria-hidden="true" className="text-xl">×</span>
          </button>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 overflow-auto bg-white">
          <iframe
            ref={iframeRef}
            srcDoc={iframeContent}
            className="w-full h-full border-0"
            title="Live preview with accessibility violations highlighted"
            sandbox=""
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 px-6 py-3 border-t border-[hsl(var(--color-border))] flex-shrink-0 bg-[hsl(var(--color-bg-surface))]">
          <span className="text-sm font-medium text-[hsl(var(--color-text-secondary))]">Violation severity:</span>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 border-2 border-[#ef4444] rounded" />
              <span className="text-[hsl(var(--color-text-secondary))]">Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 border-2 border-[#f97316] rounded" />
              <span className="text-[hsl(var(--color-text-secondary))]">Serious</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 border-2 border-[#eab308] rounded" />
              <span className="text-[hsl(var(--color-text-secondary))]">Moderate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 border-2 border-[#6b7280] rounded" />
              <span className="text-[hsl(var(--color-text-secondary))]">Minor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
