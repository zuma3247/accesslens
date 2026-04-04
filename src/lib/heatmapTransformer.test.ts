import { transformToHeatmap, buildPrincipleBreakdown } from './heatmapTransformer';
import type { Issue } from '@/types/audit.types';

test('returns 4×4 grid', () => {
  const issues: Issue[] = [];
  const grid = transformToHeatmap(issues);
  expect(grid).toHaveLength(4);
  expect(grid[0]).toHaveLength(4);
  expect(grid[1]).toHaveLength(4);
  expect(grid[2]).toHaveLength(4);
  expect(grid[3]).toHaveLength(4);
});

test('all cells zero when no issues', () => {
  const grid = transformToHeatmap([]);
  for (const row of grid) {
    for (const cell of row) {
      expect(cell.count).toBe(0);
      expect(cell.topViolationId).toBeNull();
      expect(cell.topViolationName).toBeNull();
    }
  }
});

test('correct cell populated for single issue', () => {
  const issues: Issue[] = [makeIssue('test-1', 'perceivable', 'critical', 5, 'Non-text Content')];
  const grid = transformToHeatmap(issues);
  expect(grid[0][0].count).toBe(5);
  expect(grid[0][0].topViolationId).toBe('test-1');
  expect(grid[0][0].topViolationName).toBe('Non-text Content');
});

test('affectedCount accumulates across multiple issues in same cell', () => {
  const issues: Issue[] = [
    makeIssue('test-1', 'perceivable', 'critical', 3, 'Non-text Content'),
    makeIssue('test-2', 'perceivable', 'critical', 7, 'Contrast'),
  ];
  const grid = transformToHeatmap(issues);
  expect(grid[0][0].count).toBe(10);
});

test('topViolationId is the issue with highest affectedCount', () => {
  const issues: Issue[] = [
    makeIssue('small-issue', 'perceivable', 'critical', 2, 'Small Issue'),
    makeIssue('big-issue', 'perceivable', 'critical', 10, 'Big Issue'),
  ];
  const grid = transformToHeatmap(issues);
  expect(grid[0][0].topViolationId).toBe('big-issue');
  expect(grid[0][0].topViolationName).toBe('Big Issue');
});

test('correctly maps principles to rows', () => {
  const issues: Issue[] = [
    makeIssue('op-1', 'operable', 'critical'),
    makeIssue('und-1', 'understandable', 'serious'),
    makeIssue('rob-1', 'robust', 'moderate'),
  ];
  const grid = transformToHeatmap(issues);
  expect(grid[1][0].count).toBe(1);
  expect(grid[2][1].count).toBe(1);
  expect(grid[3][2].count).toBe(1);
});

test('buildPrincipleBreakdown returns empty breakdown for no issues', () => {
  const result = buildPrincipleBreakdown([]);
  expect(result.perceivable.total).toBe(0);
  expect(result.operable.total).toBe(0);
  expect(result.understandable.total).toBe(0);
  expect(result.robust.total).toBe(0);
});

test('buildPrincipleBreakdown accumulates counts by principle and severity', () => {
  const issues: Issue[] = [
    makeIssue('p1', 'perceivable', 'critical', 5),
    makeIssue('p2', 'perceivable', 'critical', 3),
    makeIssue('o1', 'operable', 'serious', 2),
  ];
  const result = buildPrincipleBreakdown(issues);
  expect(result.perceivable.total).toBe(8);
  expect(result.perceivable.critical).toBe(8);
  expect(result.operable.total).toBe(2);
  expect(result.operable.serious).toBe(2);
});

function makeIssue(
  id: string,
  principle: 'perceivable' | 'operable' | 'understandable' | 'robust',
  severity: 'critical' | 'serious' | 'moderate' | 'minor',
  affectedCount = 1,
  name = 'Test'
): Issue {
  return {
    id,
    wcagCriterion: '1.1.1',
    wcagCriterionName: name,
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
