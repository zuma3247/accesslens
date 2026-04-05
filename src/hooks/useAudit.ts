import { useState, useCallback } from 'react';
import type {
  AuditInput,
  AuditPayload,
  HeatmapGrid,
  ViewState,
} from '@/types/audit.types';
import { runAudit } from '@/lib/auditEngine';
import { transformToHeatmap } from '@/lib/heatmapTransformer';

function formatAuditError(err: unknown): string {
  if (import.meta.env.DEV) {
    console.error('[useAudit]', err);
  }
  if (typeof err !== 'object' || err === null) {
    return 'An error occurred during audit';
  }
  const e = err as Error;
  const message = typeof e.message === 'string' ? e.message : '';
  const name = typeof e.name === 'string' ? e.name : 'Error';

  if (name === 'SyntaxError') {
    return 'Audit data could not be parsed. Please try again or use a different input.';
  }
  if (name === 'TypeError' || /failed to fetch|network|load failed/i.test(message)) {
    return 'A network or loading error occurred. Check your connection and try again.';
  }
  if (message) {
    return message;
  }
  return 'An error occurred during audit';
}

interface UseAuditReturn {
  viewState: ViewState;
  auditResult: AuditPayload | null;
  heatmapGrid: HeatmapGrid | null;
  error: string | null;
  runAudit: (input: AuditInput) => Promise<void>;
  reset: () => void;
}

export function useAudit(): UseAuditReturn {
  const [viewState, setViewState] = useState<ViewState>('idle');
  const [auditResult, setAuditResult] = useState<AuditPayload | null>(null);
  const [heatmapGrid, setHeatmapGrid] = useState<HeatmapGrid | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeAudit = useCallback(async (input: AuditInput) => {
    setViewState('loading');
    setError(null);

    try {
      const result = await runAudit(input);
      setAuditResult(result);
      setHeatmapGrid(transformToHeatmap(result.issues));
      setViewState('results');
    } catch (err) {
      setError(formatAuditError(err));
      setViewState('idle');
    }
  }, []);

  const reset = useCallback(() => {
    setViewState('idle');
    setAuditResult(null);
    setHeatmapGrid(null);
    setError(null);
  }, []);

  return {
    viewState,
    auditResult,
    heatmapGrid,
    error,
    runAudit: executeAudit,
    reset,
  };
}
