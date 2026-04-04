import { useState, useCallback } from 'react';
import type { AuditPayload } from '@/types/audit.types';
import { generateBatchPrompt } from '@/lib/promptGenerator';

interface UseBatchCopyReturn {
  copy: () => Promise<void>;
  copied: boolean;
  error: boolean;
  promptText: string;
}

const COPY_TIMEOUT = 2500;

export function useBatchCopy(payload: AuditPayload): UseBatchCopyReturn {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const promptText = generateBatchPrompt(payload);

  const copy = useCallback(async () => {
    if (!promptText) return;

    setError(false);

    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_TIMEOUT);
    } catch {
      setError(true);
    }
  }, [promptText]);

  return {
    copy,
    copied,
    error,
    promptText,
  };
}
