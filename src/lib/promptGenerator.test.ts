import { generateSinglePrompt, generateBatchPrompt } from './promptGenerator';
import type { Issue, AuditPayload } from '@/types/audit.types';

const mockIssue: Issue = {
  id: 'color-contrast',
  wcagCriterion: '1.4.3',
  wcagCriterionName: 'Contrast (Minimum)',
  wcagLevel: 'AA',
  principle: 'perceivable',
  severity: 'serious',
  description: 'Text has insufficient contrast ratio of 2.8:1.',
  fixSuggestion: 'Change color to achieve at least 4.5:1 contrast.',
  helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
  codeSnippet: '<p style="color: #999999">Low contrast text</p>',
  codeFixExample: '<p style="color: #767676">Fixed contrast text</p>',
  affectedCount: 5,
  hasBeforeAfter: true,
  beforeAfterType: 'contrast',
};

const mockIssueNoFix: Issue = {
  ...mockIssue,
  id: 'no-fix-example',
  codeFixExample: '',
};

test('generateSinglePrompt contains required fields and formatting', () => {
  const prompt = generateSinglePrompt(mockIssue);
  expect(prompt).toContain('1.4.3');
  expect(prompt).toContain('Contrast (Minimum)');
  expect(prompt).toContain(mockIssue.codeSnippet);
  expect(prompt).toContain(mockIssue.description);
  expect(prompt).toContain(mockIssue.fixSuggestion);
  expect(prompt).toContain('EXAMPLE FIX');
  expect(prompt).toContain(mockIssue.codeFixExample);
  expect(prompt).toContain(mockIssue.helpUrl);
  expect(prompt).toContain('5 instance(s)');
  expect(prompt).toContain('Perceivable');
  expect(prompt).toContain('YOUR INSTRUCTIONS');
  expect(prompt).toContain('VIOLATION DETAILS');
  expect(prompt).toContain('CURRENT (FAILING) CODE');
  expect(prompt).toContain('WHAT IS WRONG');
  expect(prompt).toContain('HOW TO FIX IT');
  expect(prompt).toBe(prompt.trim());
});

test('generateSinglePrompt handles empty codeFixExample gracefully', () => {
  const prompt = generateSinglePrompt(mockIssueNoFix);
  expect(prompt).toContain('No specific code example available');
});

test('generateBatchPrompt returns empty string when no critical issues', () => {
  const payload: AuditPayload = {
    id: 'test-audit',
    auditedInput: 'demo.accesslens.app/dashboard',
    auditedAt: '2026-04-03T10:00:00.000Z',
    source: 'mock',
    overallScore: 44,
    grade: 'Fail',
    levelBreakdown: {
      A: { total: 14, passing: 9, failing: 5 },
      AA: { total: 12, passing: 6, failing: 6 },
      AAA: { total: 8, passing: 4, failing: 4 },
    },
    principleBreakdown: {
      perceivable: { total: 12, critical: 4, serious: 5, moderate: 2, minor: 1 },
      operable: { total: 7, critical: 2, serious: 3, moderate: 1, minor: 1 },
      understandable: { total: 3, critical: 0, serious: 1, moderate: 1, minor: 1 },
      robust: { total: 2, critical: 0, serious: 1, moderate: 1, minor: 0 },
    },
    issues: [{ ...mockIssue, severity: 'serious' }],
    passingCriteria: [],
    totalElements: 100,
  };
  expect(generateBatchPrompt(payload)).toBe('');
});

test('generateBatchPrompt includes all critical issues and FINAL CONFIRMATION section', () => {
  const payload: AuditPayload = {
    id: 'test-audit',
    auditedInput: 'demo.accesslens.app/dashboard',
    auditedAt: '2026-04-03T10:00:00.000Z',
    source: 'mock',
    overallScore: 44,
    grade: 'Fail',
    levelBreakdown: {
      A: { total: 14, passing: 9, failing: 5 },
      AA: { total: 12, passing: 6, failing: 6 },
      AAA: { total: 8, passing: 4, failing: 4 },
    },
    principleBreakdown: {
      perceivable: { total: 12, critical: 4, serious: 5, moderate: 2, minor: 1 },
      operable: { total: 7, critical: 2, serious: 3, moderate: 1, minor: 1 },
      understandable: { total: 3, critical: 0, serious: 1, moderate: 1, minor: 1 },
      robust: { total: 2, critical: 0, serious: 1, moderate: 1, minor: 0 },
    },
    issues: [
      { ...mockIssue, id: 'critical-1', severity: 'critical', affectedCount: 3 },
      { ...mockIssue, id: 'critical-2', severity: 'critical', affectedCount: 5 },
      { ...mockIssue, id: 'serious-1', severity: 'serious', affectedCount: 2 },
    ],
    passingCriteria: [],
    totalElements: 100,
  };

  const prompt = generateBatchPrompt(payload);
  expect(prompt).toContain('VIOLATION 1 OF 2');
  expect(prompt).toContain('VIOLATION 2 OF 2');
  expect(prompt).toContain('demo.accesslens.app/dashboard');
  expect(prompt).toContain('Total critical violations: 2');
  expect(prompt).toContain('FINAL CONFIRMATION');
  expect(prompt).toContain('Each WCAG criterion listed above now passes');
  expect(prompt).toContain('Failing code:');
  expect(prompt).toContain('How to fix:');
  expect(prompt).toContain('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  expect(prompt).toBe(prompt.trim());
});
