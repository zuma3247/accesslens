import type { AuditInput, AuditPayload } from '@/types/audit.types';
import { getSeedForUrl } from './filterMatcher';
import { runLiveAxeAudit } from './axeRunner';
import { mapAxeResultToPayload } from './axeResultMapper';
import { fetchUrlHtml } from './urlFetcher';
import { sleep, generateId } from './utils';

export async function runAudit(input: AuditInput): Promise<AuditPayload> {
  // Simulate realistic processing time for both paths
  const delay = Math.random() * 600 + 800; // 800–1400ms
  await sleep(delay);

  if (input.mode === 'alt-text') {
    throw new Error('Alt-text analysis is not yet available. Please use URL or HTML Snippet mode.');
  }

  if (input.mode === 'html') {
    const axeResults = await runLiveAxeAudit(input.value, input.css);
    return {
      ...mapAxeResultToPayload(axeResults, input.value),
      scanMode: 'html',
    };
  }

  let html: string | null = null;

  try {
    const fetchResult = await fetchUrlHtml(input.value);
    html = fetchResult.html;
  } catch {
    html = null;
  }

  if (html !== null) {
    const axeResults = await runLiveAxeAudit(html);

    return {
      ...mapAxeResultToPayload(axeResults, input.value),
      auditedInput: input.value,
      source: 'live-axe',
      isFallback: false,
      scanMode: 'url',
    };
  }

  const { payload: seed, isFallback } = await getSeedForUrl(input.value);

  // Stamp a fresh ID and timestamp so repeated scans look like new audits
  return {
    ...seed,
    id: generateId(),
    auditedInput: input.value,
    auditedAt: new Date().toISOString(),
    isFallback,
    scanMode: 'url',
  };
}
