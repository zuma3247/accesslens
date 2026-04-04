import { useState, useCallback } from 'react';
import type {
  AuditInput,
  AuditPayload,
  HeatmapGrid,
  ViewState,
} from '@/types/audit.types';
import { runAudit } from '@/lib/auditEngine';
import { transformToHeatmap } from '@/lib/heatmapTransformer';

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
      setError(err instanceof Error ? err.message : 'An error occurred during audit');
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
