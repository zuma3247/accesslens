import { describe, it, expect } from 'vitest';
import { generateSinglePrompt, generateBatchPrompt } from '../promptGenerator';
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

describe('generateSinglePrompt', () => {
  it('contains wcagCriterion', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain('1.4.3');
  });

  it('contains wcagCriterionName', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain('Contrast (Minimum)');
  });

  it('contains codeSnippet', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain(mockIssue.codeSnippet);
  });

  it('contains description', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain(mockIssue.description);
  });

  it('contains fixSuggestion', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain(mockIssue.fixSuggestion);
  });

  it('contains codeFixExample when present', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain('EXAMPLE FIX');
    expect(prompt).toContain(mockIssue.codeFixExample);
  });

  it('handles empty codeFixExample gracefully', () => {
    const prompt = generateSinglePrompt(mockIssueNoFix);
    expect(prompt).toContain('No specific code example available');
  });

  it('contains helpUrl', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain(mockIssue.helpUrl);
  });

  it('contains affectedCount', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain('5 instance(s)');
  });

  it('trims to remove leading/trailing whitespace', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toBe(prompt.trim());
    expect(prompt).not.toMatch(/^\s/);
    expect(prompt).not.toMatch(/\s$/);
  });

  it('contains principle description', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain('Perceivable');
  });

  it('contains severity level', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain('serious');
  });

  it('contains conformance level', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain('WCAG AA');
  });

  it('contains instructions section', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain('YOUR INSTRUCTIONS');
    expect(prompt).toContain('Find all 5 instance(s)');
  });

  it('contains violation details section', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain('VIOLATION DETAILS');
  });

  it('contains current code section', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain('CURRENT (FAILING) CODE');
  });

  it('contains what is wrong section', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain('WHAT IS WRONG');
  });

  it('contains how to fix section', () => {
    const prompt = generateSinglePrompt(mockIssue);
    expect(prompt).toContain('HOW TO FIX IT');
  });
});

describe('generateBatchPrompt', () => {
  const mockPayload: AuditPayload = {
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

  it('returns empty string when no critical issues', () => {
    const noCriticals: AuditPayload = {
      ...mockPayload,
      issues: [{ ...mockIssue, severity: 'serious' }],
    };
    expect(generateBatchPrompt(noCriticals)).toBe('');
  });

  it('includes all critical issues', () => {
    const prompt = generateBatchPrompt(mockPayload);
    expect(prompt).toContain('VIOLATION 1 OF 2');
    expect(prompt).toContain('VIOLATION 2 OF 2');
  });

  it('includes auditedInput in header', () => {
    const prompt = generateBatchPrompt(mockPayload);
    expect(prompt).toContain('demo.accesslens.app/dashboard');
  });

  it('numbers violations correctly', () => {
    const prompt = generateBatchPrompt(mockPayload);
    expect(prompt).toContain('Total critical violations: 2');
    expect(prompt).toContain('After all 2 fixes');
  });

  it('includes FINAL CONFIRMATION section', () => {
    const prompt = generateBatchPrompt(mockPayload);
    expect(prompt).toContain('FINAL CONFIRMATION');
    expect(prompt).toContain('Each WCAG criterion listed above now passes');
  });

  it('includes failing code for each violation', () => {
    const prompt = generateBatchPrompt(mockPayload);
    expect(prompt).toContain('Failing code:');
    expect(prompt).toContain(mockIssue.codeSnippet);
  });

  it('includes fix guidance for each violation', () => {
    const prompt = generateBatchPrompt(mockPayload);
    expect(prompt).toContain('How to fix:');
    expect(prompt).toContain(mockIssue.fixSuggestion);
  });

  it('includes separator lines', () => {
    const prompt = generateBatchPrompt(mockPayload);
    expect(prompt).toContain('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });

  it('is properly trimmed', () => {
    const prompt = generateBatchPrompt(mockPayload);
    expect(prompt).toBe(prompt.trim());
  });
});
