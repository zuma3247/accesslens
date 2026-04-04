import type { Issue, AuditPayload } from '@/types/audit.types';

const SEP = '━'.repeat(39);

const PRINCIPLE_DESCRIPTIONS: Record<string, string> = {
  perceivable: 'Perceivable — information must be presentable in ways users can perceive',
  operable: 'Operable — UI components and navigation must be operable',
  understandable: 'Understandable — information and operation must be understandable',
  robust: 'Robust — content must be interpreted reliably by assistive technologies',
};

export function generateSinglePrompt(issue: Issue): string {
  const fixExampleSection = issue.codeFixExample
    ? `\n${SEP}\nEXAMPLE FIX\n${SEP}\n${issue.codeFixExample}`
    : '\n(No specific code example available — apply the fix direction above to the current code.)';

  return `You are a WCAG 2.2 accessibility expert and senior front-end developer.

Fix the following accessibility violation in my codebase.

${SEP}
VIOLATION DETAILS
${SEP}
WCAG Criterion:    ${issue.wcagCriterion} — ${issue.wcagCriterionName}
Conformance Level: WCAG ${issue.wcagLevel}
Severity:          ${issue.severity} (as classified by axe-core)
WCAG Principle:    ${PRINCIPLE_DESCRIPTIONS[issue.principle]}
Affected Elements: ${issue.affectedCount} instance(s) on this page

${SEP}
CURRENT (FAILING) CODE
${SEP}
${issue.codeSnippet}

${SEP}
WHAT IS WRONG
${SEP}
${issue.description}

${SEP}
HOW TO FIX IT
${SEP}
${issue.fixSuggestion}${fixExampleSection}

${SEP}
YOUR INSTRUCTIONS
${SEP}
1. Find all ${issue.affectedCount} instance(s) of this pattern in the codebase.
2. Apply the fix to each instance.
3. Confirm the fix satisfies WCAG ${issue.wcagLevel} criterion ${issue.wcagCriterion}.
4. Change ONLY what is necessary — do not alter logic, layout, or unrelated styles.
5. Show me the before and after code for each change.

Reference: ${issue.helpUrl}`.trim();
}

export function generateBatchPrompt(payload: AuditPayload): string {
  const criticals = payload.issues.filter((i) => i.severity === 'critical');
  if (criticals.length === 0) return '';

  const issueBlocks = criticals
    .map(
      (issue, idx) => `
${SEP}
VIOLATION ${idx + 1} OF ${criticals.length}
${SEP}
WCAG ${issue.wcagCriterion} — ${issue.wcagCriterionName} (Level ${issue.wcagLevel})
Affected Elements: ${issue.affectedCount}

Failing code:
${issue.codeSnippet}

What is wrong:
${issue.description}

How to fix:
${issue.fixSuggestion}${issue.codeFixExample ? `\n\nExample fix:\n${issue.codeFixExample}` : ''}

Reference: ${issue.helpUrl}`
    )
    .join('\n');

  return `You are a WCAG 2.2 accessibility expert and senior front-end developer.

Fix ALL of the following critical accessibility violations in my codebase.

Audit source:              ${payload.auditedInput}
Total critical violations: ${criticals.length}

Apply all fixes in a single pass.
For each fix, show me the before and after code.
Do not change logic, layout, or unrelated styles.
If any two fixes conflict, flag the conflict before making either change.
${issueBlocks}

${SEP}
FINAL CONFIRMATION
${SEP}
After all ${criticals.length} fixes are applied, confirm that:
- Each WCAG criterion listed above now passes at its stated conformance level
- No new violations were introduced
- No existing functionality was changed`.trim();
}
