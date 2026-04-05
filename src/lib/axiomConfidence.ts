/**
 * Axe Rule Confidence Ratings
 * Static lookup for rule reliability to reduce false positive noise
 */

import type { ConfidenceLevel } from '@/types/audit.types';

export interface ConfidenceInfo {
  level: ConfidenceLevel;
  label: string;
  description: string;
}

export const AXE_RULE_CONFIDENCE: Record<string, ConfidenceInfo> = {
  // CONFIRMED — near-zero false positive rate; fix without question
  'image-alt': {
    level: 'confirmed',
    label: 'Confirmed Issue',
    description: 'Missing alt text is always a real accessibility barrier.',
  },
  'html-has-lang': {
    level: 'confirmed',
    label: 'Confirmed Issue',
    description: 'Every page needs a language declaration for screen readers.',
  },
  'html-lang-valid': {
    level: 'confirmed',
    label: 'Confirmed Issue',
    description: 'Invalid language codes break screen reader pronunciation.',
  },
  'document-title': {
    level: 'confirmed',
    label: 'Confirmed Issue',
    description: 'Missing page title is always a failure.',
  },
  'label': {
    level: 'confirmed',
    label: 'Confirmed Issue',
    description: 'Form inputs without labels are inaccessible to screen readers.',
  },
  'button-name': {
    level: 'confirmed',
    label: 'Confirmed Issue',
    description: 'Buttons must have accessible names for screen reader users.',
  },
  'link-name': {
    level: 'confirmed',
    label: 'Confirmed Issue',
    description: 'Links without text content need aria-label or aria-labelledby.',
  },
  'duplicate-id-active': {
    level: 'confirmed',
    label: 'Confirmed Issue',
    description: 'Duplicate IDs break label associations and focus management.',
  },
  'bypass': {
    level: 'confirmed',
    label: 'Confirmed Issue',
    description: 'Skip links are essential for keyboard navigation efficiency.',
  },
  'meta-viewport': {
    level: 'confirmed',
    label: 'Confirmed Issue',
    description: 'Zoom restrictions prevent low-vision users from magnifying content.',
  },

  // LIKELY — high true-positive rate but context-dependent
  'color-contrast': {
    level: 'likely',
    label: 'Likely Issue',
    description: 'Contrast check may fire on dynamic or gradient backgrounds where static analysis cannot determine true rendered color. Verify manually if in doubt.',
  },
  'heading-order': {
    level: 'likely',
    label: 'Likely Issue',
    description: 'Intentional heading structure may vary for design reasons, but improper nesting confuses screen reader navigation.',
  },
  'target-size': {
    level: 'likely',
    label: 'Likely Issue',
    description: 'Small touch targets are problematic, but padding-based targets may genuinely pass WCAG 2.5.5.',
  },
  'autocomplete-valid': {
    level: 'likely',
    label: 'Likely Issue',
    description: 'Autocomplete attributes improve usability but some custom inputs may intentionally omit them.',
  },
  'aria-allowed-attr': {
    level: 'likely',
    label: 'Likely Issue',
    description: 'Invalid ARIA attributes usually indicate errors, but some dynamic widgets manage attributes at runtime.',
  },

  // REVIEW — meaningful false-positive rate; requires manual verification
  'aria-required-children': {
    level: 'review',
    label: 'Needs Review',
    description: 'axe-core flags invalid parent-child ARIA relationships in the static DOM. Custom component libraries frequently manage these relationships dynamically at runtime, which axe cannot observe. Verify manually before acting.',
  },
  'aria-required-parent': {
    level: 'review',
    label: 'Needs Review',
    description: 'Required ARIA parent checks may fail on custom components that inject parent roles via JavaScript after initial render.',
  },
  'scrollable-region-focusable': {
    level: 'review',
    label: 'Needs Review',
    description: 'Scrollable regions should be keyboard accessible, but JavaScript scroll handlers may cover this functionality dynamically.',
  },
  'tabindex': {
    level: 'review',
    label: 'Needs Review',
    description: 'Tabindex values other than 0 or -1 are usually errors, but intentional focus management in complex widgets may be valid.',
  },
  'landmark-one-main': {
    level: 'review',
    label: 'Needs Review',
    description: 'SPAs often manage main landmark dynamically based on current route, which static analysis cannot determine.',
  },
};

// Default confidence for any rule not in the map
export const DEFAULT_CONFIDENCE: ConfidenceInfo = {
  level: 'likely',
  label: 'Likely Issue',
  description: 'This rule has a moderate false positive rate. Verify if the violation applies to your specific implementation.',
};

/**
 * Get confidence info for a given axe rule ID
 */
export function getConfidenceForRule(ruleId: string): ConfidenceInfo {
  return AXE_RULE_CONFIDENCE[ruleId] || DEFAULT_CONFIDENCE;
}

/**
 * Get confidence level badge style classes
 */
export function getConfidenceBadgeClasses(level: ConfidenceLevel): string {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium';

  switch (level) {
    case 'confirmed':
      return `${baseClasses} bg-[hsl(var(--color-error-bg))] text-[hsl(var(--color-error-text))] border border-[hsl(var(--color-error-border))]`;
    case 'likely':
      return `${baseClasses} bg-[hsl(var(--color-warning-bg))] text-[hsl(var(--color-warning-text))] border border-[hsl(var(--color-warning-border))]`;
    case 'review':
      return `${baseClasses} bg-[hsl(var(--color-bg-elevated))] text-[hsl(var(--color-text-secondary))] border border-[hsl(var(--color-border))]`;
    default:
      return baseClasses;
  }
}

/**
 * Dismissal reasons for false positive classification
 */
export const DISMISSAL_REASONS = [
  { value: 'custom-component', label: 'Custom component handles this via JavaScript' },
  { value: 'intentional-design', label: 'Intentional design decision reviewed by accessibility team' },
  { value: 'third-party', label: 'Third-party widget — outside our control' },
  { value: 'duplicate', label: 'Duplicate of another reported issue' },
  { value: 'other', label: 'Other' },
] as const;

export type DismissalReason = typeof DISMISSAL_REASONS[number]['value'];

/**
 * Generate a stable dismissal key for an issue
 */
export function generateDismissalKey(
  scanMode: string,
  ruleId: string,
  issueId: string
): string {
  return `${scanMode}:${ruleId}:${issueId}`;
}

/**
 * Dismissed violations storage key
 */
export const DISMISSED_VIOLATIONS_KEY = 'accesslens-dismissed-violations';

/**
 * Get dismissed violations from localStorage
 */
export function getDismissedViolations(): Set<string> {
  if (typeof window === 'undefined') return new Set();

  try {
    const stored = localStorage.getItem(DISMISSED_VIOLATIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Set(Array.isArray(parsed) ? parsed : []);
    }
  } catch {
    // localStorage unavailable or corrupt
  }
  return new Set();
}

/**
 * Save dismissed violations to localStorage
 */
export function saveDismissedViolations(keys: Set<string>): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(DISMISSED_VIOLATIONS_KEY, JSON.stringify(Array.from(keys)));
  } catch {
    // localStorage unavailable
  }
}

/**
 * Add a violation to dismissed set
 */
export function dismissViolation(key: string): void {
  const dismissed = getDismissedViolations();
  dismissed.add(key);
  saveDismissedViolations(dismissed);
}

/**
 * Restore a previously dismissed violation
 */
export function restoreViolation(key: string): void {
  const dismissed = getDismissedViolations();
  dismissed.delete(key);
  saveDismissedViolations(dismissed);
}
