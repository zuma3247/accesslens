import type { Issue } from '@/types/audit.types';

export interface ContrastDemoProps {
  failingColor: string;
  passingColor: string;
  failingRatio: string;
  passingRatio: string;
  text: string;
  criterionNote: string;
}

export interface AltTextDemoProps {
  failingAlt: string;
  passingAlt: string;
  imageDescription: string;
}

export interface TouchTargetDemoProps {
  failingSize: { width: number; height: number };
  passingSize: { width: number; height: number };
  label: string;
}

export type DemoContent = ContrastDemoProps | AltTextDemoProps | TouchTargetDemoProps;

export function getDemoContent(issue: Issue): DemoContent | null {
  if (!issue.hasBeforeAfter || !issue.beforeAfterType) {
    return null;
  }

  switch (issue.beforeAfterType) {
    case 'contrast': {
      // Extract colors from code snippet if possible, otherwise use defaults
      const failingColor = extractColorFromSnippet(issue.codeSnippet) || '#999999';
      const passingColor = extractColorFromSnippet(issue.codeFixExample) || '#767676';
      
      return {
        failingColor,
        passingColor,
        failingRatio: '2.8:1',
        passingRatio: '4.5:1',
        text: extractTextFromSnippet(issue.codeSnippet) || 'Sample text',
        criterionNote: 'WCAG 2.2 requires 4.5:1 for normal text (Criterion 1.4.3 AA).',
      } as ContrastDemoProps;
    }

    case 'alt-text': {
      return {
        failingAlt: '[image]',
        passingAlt: '[Image: Bar chart showing Q3 revenue by region. EMEA leads at 42%.]',
        imageDescription: 'Revenue chart visualization',
      } as AltTextDemoProps;
    }

    case 'touch-target': {
      return {
        failingSize: { width: 18, height: 18 },
        passingSize: { width: 24, height: 24 },
        label: 'Close',
      } as TouchTargetDemoProps;
    }

    default:
      return null;
  }
}

// Helper functions to extract data from code snippets
function extractColorFromSnippet(snippet: string): string | null {
  const colorMatch = snippet.match(/color:\s*#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/i);
  return colorMatch ? `#${colorMatch[1]}` : null;
}

function extractTextFromSnippet(snippet: string): string | null {
  const textMatch = snippet.match(/>([^<]+)</);
  return textMatch ? textMatch[1].trim() : null;
}
