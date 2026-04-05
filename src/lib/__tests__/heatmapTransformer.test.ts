import { describe, it, expect } from 'vitest';
import { transformToHeatmap, buildPrincipleBreakdown } from '../heatmapTransformer';
import type { Issue } from '@/types/audit.types';

describe('transformToHeatmap', () => {
  it('returns 4×4 grid', () => {
    const issues: Issue[] = [];
    const grid = transformToHeatmap(issues);
    expect(grid).toHaveLength(4); // 4 principles (rows)
    expect(grid[0]).toHaveLength(4); // 4 severities (columns)
    expect(grid[1]).toHaveLength(4);
    expect(grid[2]).toHaveLength(4);
    expect(grid[3]).toHaveLength(4);
  });

  it('all cells zero when no issues', () => {
    const issues: Issue[] = [];
    const grid = transformToHeatmap(issues);
    for (const row of grid) {
      for (const cell of row) {
        expect(cell.count).toBe(0);
        expect(cell.topViolationId).toBeNull();
        expect(cell.topViolationName).toBeNull();
      }
    }
  });

  it('correct cell populated for single issue', () => {
    const issues: Issue[] = [
      {
        id: 'test-1',
        ruleId: 'test-rule',
        wcagCriterion: '1.1.1',
        wcagCriterionName: 'Non-text Content',
        wcagLevel: 'A',
        principle: 'perceivable',
        severity: 'critical',
        description: 'Test description',
        fixSuggestion: 'Test fix',
        helpUrl: 'https://example.com',
        codeSnippet: '<img>',
        codeFixExample: '<img alt="test">',
        affectedCount: 5,
        hasBeforeAfter: false,
      },
    ];
    const grid = transformToHeatmap(issues);
    // Perceivable (row 0), Critical (column 0)
    expect(grid[0][0].count).toBe(5);
    expect(grid[0][0].topViolationId).toBe('test-1');
    expect(grid[0][0].topViolationName).toBe('Non-text Content');
    // All other cells should be zero
    expect(grid[1][0].count).toBe(0);
    expect(grid[0][1].count).toBe(0);
  });

  it('affectedCount accumulates across multiple issues in same cell', () => {
    const issues: Issue[] = [
      {
        id: 'test-1',
        ruleId: 'test-rule',
        wcagCriterion: '1.1.1',
        wcagCriterionName: 'Non-text Content',
        wcagLevel: 'A',
        principle: 'perceivable',
        severity: 'critical',
        description: 'Test',
        fixSuggestion: 'Fix',
        helpUrl: 'https://example.com',
        codeSnippet: '<img>',
        codeFixExample: '<img alt="test">',
        affectedCount: 3,
        hasBeforeAfter: false,
      },
      {
        id: 'test-2',
        ruleId: 'test-rule',
        wcagCriterion: '1.4.3',
        wcagCriterionName: 'Contrast',
        wcagLevel: 'AA',
        principle: 'perceivable',
        severity: 'critical',
        description: 'Test',
        fixSuggestion: 'Fix',
        helpUrl: 'https://example.com',
        codeSnippet: '<p>',
        codeFixExample: '<p style="color:black">',
        affectedCount: 7,
        hasBeforeAfter: false,
      },
    ];
    const grid = transformToHeatmap(issues);
    expect(grid[0][0].count).toBe(10); // 3 + 7
  });

  it('topViolationId is the issue with highest affectedCount', () => {
    const issues: Issue[] = [
      {
        id: 'small-issue',
        ruleId: 'test-rule',
        wcagCriterion: '1.1.1',
        wcagCriterionName: 'Small Issue',
        wcagLevel: 'A',
        principle: 'perceivable',
        severity: 'critical',
        description: 'Test',
        fixSuggestion: 'Fix',
        helpUrl: 'https://example.com',
        codeSnippet: '<img>',
        codeFixExample: '<img alt="test">',
        affectedCount: 2,
        hasBeforeAfter: false,
      },
      {
        id: 'big-issue',
        ruleId: 'test-rule',
        wcagCriterion: '1.4.3',
        wcagCriterionName: 'Big Issue',
        wcagLevel: 'AA',
        principle: 'perceivable',
        severity: 'critical',
        description: 'Test',
        fixSuggestion: 'Fix',
        helpUrl: 'https://example.com',
        codeSnippet: '<p>',
        codeFixExample: '<p style="color:black">',
        affectedCount: 10,
        hasBeforeAfter: false,
      },
    ];
    const grid = transformToHeatmap(issues);
    expect(grid[0][0].topViolationId).toBe('big-issue');
    expect(grid[0][0].topViolationName).toBe('Big Issue');
  });

  it('correctly maps principles to rows', () => {
    const issues: Issue[] = [
      createIssue('op-1', 'operable', 'critical'),
      createIssue('und-1', 'understandable', 'serious'),
      createIssue('rob-1', 'robust', 'moderate'),
    ];
    const grid = transformToHeatmap(issues);
    // operable = row 1, understandable = row 2, robust = row 3
    expect(grid[1][0].count).toBe(1); // operable, critical
    expect(grid[2][1].count).toBe(1); // understandable, serious
    expect(grid[3][2].count).toBe(1); // robust, moderate
  });
});

describe('buildPrincipleBreakdown', () => {
  it('returns empty breakdown for no issues', () => {
    const result = buildPrincipleBreakdown([]);
    expect(result.perceivable.total).toBe(0);
    expect(result.operable.total).toBe(0);
    expect(result.understandable.total).toBe(0);
    expect(result.robust.total).toBe(0);
  });

  it('accumulates counts by principle and severity', () => {
    const issues: Issue[] = [
      createIssue('p1', 'perceivable', 'critical', 5),
      createIssue('p2', 'perceivable', 'critical', 3),
      createIssue('o1', 'operable', 'serious', 2),
    ];
    const result = buildPrincipleBreakdown(issues);
    expect(result.perceivable.total).toBe(8);
    expect(result.perceivable.critical).toBe(8);
    expect(result.operable.total).toBe(2);
    expect(result.operable.serious).toBe(2);
    expect(result.understandable.total).toBe(0);
  });
});

// Helper function to create minimal Issue objects
function createIssue(
  id: string,
  principle: 'perceivable' | 'operable' | 'understandable' | 'robust',
  severity: 'critical' | 'serious' | 'moderate' | 'minor',
  affectedCount = 1
): Issue {
  return {
    id,
    ruleId: 'test-rule',
    wcagCriterion: '1.1.1',
    wcagCriterionName: 'Test',
    wcagLevel: 'A',
    principle,
    severity,
    description: 'Test',
    fixSuggestion: 'Fix',
    helpUrl: 'https://example.com',
    codeSnippet: '<div>',
    codeFixExample: '<div>',
    affectedCount,
    hasBeforeAfter: false,
  };
}
