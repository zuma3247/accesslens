import axe from 'axe-core';
import type { AxeResults } from 'axe-core';
// Raw import bypasses Vite's bundler transformation. axe.source uses axeFunction.toString()
// which, after minification, references mangled closure variables that don't exist in the
// iframe scope. The raw pre-built UMD file is self-contained and eval-safe.
import axeSourceRaw from 'axe-core/axe.min.js?raw';

/**
 * Parse HTML in an inert Document via DOMParser (scripts do not run during parse),
 * then populate an isolated iframe document so audited styles do not leak into the
 * host application.
 */
function populateAuditDocument(auditDocument: Document, htmlString: string, cssString?: string): void {
  const parsed = new DOMParser().parseFromString(htmlString, 'text/html');
  parsed.querySelectorAll('script').forEach((s) => s.remove());

  auditDocument.open();
  auditDocument.write('<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body></body></html>');
  auditDocument.close();

  const headStyles = Array.from(parsed.head.querySelectorAll('style'));
  for (const styleEl of headStyles) {
    const importedStyle = auditDocument.createElement('style');
    importedStyle.textContent = styleEl.textContent ?? '';
    auditDocument.head.appendChild(importedStyle);
  }

  if (cssString?.trim()) {
    const userStyle = auditDocument.createElement('style');
    userStyle.textContent = cssString.trim();
    auditDocument.head.appendChild(userStyle);
  }

  const children = Array.from(parsed.body.childNodes);
  for (const node of children) {
    auditDocument.body.appendChild(auditDocument.importNode(node, true));
  }
}

function createAuditIframe(): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.tabIndex = -1;
  iframe.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;border:0;visibility:hidden';
  document.body.appendChild(iframe);
  return iframe;
}

function injectAxeIntoIframe(iframeWindow: Window & typeof globalThis & { axe?: typeof axe }): typeof axe {
  // Indirect eval executes in the iframe's global scope, reliably setting window.axe.
  // Script element injection doesn't work reliably on documents created via document.write().
  (0, iframeWindow.eval)(axeSourceRaw);

  if (!iframeWindow.axe) {
    throw new Error('Failed to inject axe-core into the audit iframe.');
  }
  return iframeWindow.axe;
}

export async function runLiveAxeAudit(htmlString: string, cssString?: string): Promise<AxeResults> {
  const iframe = createAuditIframe();

  try {
    const auditDocument = iframe.contentDocument;
    const iframeWindow = iframe.contentWindow as (Window & typeof globalThis & { axe?: typeof axe }) | null;

    if (!auditDocument || !iframeWindow) {
      throw new Error('Unable to create an isolated audit frame.');
    }

    populateAuditDocument(auditDocument, htmlString, cssString);
    if (!auditDocument.documentElement || !auditDocument.body) {
      throw new Error('Audit iframe document was corrupted during HTML population.');
    }
    const iframeAxe = injectAxeIntoIframe(iframeWindow);

    const results = await iframeAxe.run(auditDocument, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag22aa'],
      },
      reporter: 'v2',
    });

    return results;
  } finally {
    iframe.remove();
  }
}
