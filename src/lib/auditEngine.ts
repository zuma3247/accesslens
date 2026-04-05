import type { AuditInput, AuditPayload } from '@/types/audit.types';
import { getSeedForUrl } from './filterMatcher';
import { runLiveAxeAudit } from './axeRunner';
import { mapAxeResultToPayload } from './axeResultMapper';
import { sleep, generateId } from './utils';

export async function runAudit(input: AuditInput): Promise<AuditPayload> {
  // Simulate realistic processing time for both paths
  const delay = Math.random() * 600 + 800; // 800–1400ms
  await sleep(delay);

  if (input.mode === 'html') {
    const axeResults = await runLiveAxeAudit(input.value);
    return mapAxeResultToPayload(axeResults, input.value);
  }

  // URL mode: load matching seed file
  const { payload: seed, isFallback } = await getSeedForUrl(input.value);

  // Stamp a fresh ID and timestamp so repeated scans look like new audits
  return {
    ...seed,
    id: generateId(),
    auditedInput: input.value,
    auditedAt: new Date().toISOString(),
    isFallback,
  };
}
