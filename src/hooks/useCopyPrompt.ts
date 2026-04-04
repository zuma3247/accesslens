import { useState, useCallback } from 'react';
import type { Issue } from '@/types/audit.types';
import { generateSinglePrompt } from '@/lib/promptGenerator';

interface UseCopyPromptReturn {
  copy: () => Promise<void>;
  copied: boolean;
  error: boolean;
}

const COPY_TIMEOUT = 2500;

export function useCopyPrompt(issue: Issue): UseCopyPromptReturn {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const copy = useCallback(async () => {
    setError(false);
    const prompt = generateSinglePrompt(issue);

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_TIMEOUT);
    } catch {
      setError(true);
    }
  }, [issue]);

  return {
    copy,
    copied,
    error,
  };
}
