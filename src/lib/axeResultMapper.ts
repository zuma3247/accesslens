import type { AxeResults, Result, NodeResult } from 'axe-core';
import type {
  AuditPayload,
  Issue,
  WcagLevel,
  WcagPrinciple,
  IssueSeverity,
  LevelBreakdown,
} from '@/types/audit.types';
import { generateId } from './utils';
import { calculateOverallScore, calculateGrade } from './scoreCalculator';
import { buildPrincipleBreakdown } from './heatmapTransformer';

// axe-core impact → IssueSeverity
const IMPACT_MAP: Record<string, IssueSeverity> = {
  critical: 'critical',
  serious: 'serious',
  moderate: 'moderate',
  minor: 'minor',
};

// axe-core tags include WCAG principle references (e.g., "wcag2a", "best-practice")
// This heuristic maps common axe rule IDs to WCAG principles
const PRINCIPLE_MAP: Record<string, WcagPrinciple> = {
  'color-contrast': 'perceivable',
  'color-contrast-enhanced': 'perceivable',
  'image-alt': 'perceivable',
  'image-redundant-alt': 'perceivable',
  'label': 'understandable',
  'label-title-only': 'understandable',
  'keyboard': 'operable',
  'focus-order-semantics': 'operable',
  'tabindex': 'operable',
  'aria-required-attr': 'robust',
  'aria-required-children': 'robust',
  'aria-required-parent': 'robust',
  'aria-roles': 'robust',
  'aria-valid-attr': 'robust',
  'aria-valid-attr-value': 'robust',
  'duplicate-id': 'robust',
  'empty-heading': 'perceivable',
  'heading-order': 'perceivable',
  'page-has-heading-one': 'perceivable',
  'link-in-text-block': 'perceivable',
  'link-name': 'operable',
  'list': 'perceivable',
  'listitem': 'perceivable',
  'meta-viewport': 'operable',
  'target-size': 'operable',
};

function extractWcagCriterion(result: Result): { criterion: string; level: WcagLevel } {
  // axe-core tags include wcag tags like "wcag143", "wcag111"
  const wcagTag = result.tags.find((t) => /^wcag\d{3,}$/.test(t));
  if (!wcagTag) return { criterion: 'Best Practice', level: 'AA' };

  // "wcag143" → "1.4.3"
  const digits = wcagTag.replace('wcag', '');
  const criterion = digits.split('').join('.').replace(/\.(\d)$/, '.$1');

  const level: WcagLevel = result.tags.includes('wcag2aaa')
    ? 'AAA'
    : result.tags.includes('wcag2aa')
      ? 'AA'
      : 'A';

  return { criterion, level };
}

function axeNodeToCodeSnippet(node: NodeResult): string {
  const raw = node.html ?? node.target.join(' ');
  return raw.length > 120 ? raw.slice(0, 117) + '...' : raw;
}

function calculateLevelBreakdownFromAxe(
  issues: Issue[],
  passes: Result[]
): LevelBreakdown {
  // Build a map of all criteria and their status
  const criteriaStatus = new Map<
    string,
    { level: WcagLevel; passing: boolean; principle: WcagPrinciple }
  >();

  // Add passing criteria
  for (const pass of passes) {
    const { criterion, level } = extractWcagCriterion(pass);
    const principle = PRINCIPLE_MAP[pass.id] ?? 'robust';
    criteriaStatus.set(criterion, { level, passing: true, principle });
  }

  // Add/update failing criteria (issues override passes)
  for (const issue of issues) {
    criteriaStatus.set(issue.wcagCriterion, {
      level: issue.wcagLevel,
      passing: false,
      principle: issue.principle,
    });
  }

  // Build breakdown
  const breakdown: LevelBreakdown = {
    A: { total: 0, passing: 0, failing: 0 },
    AA: { total: 0, passing: 0, failing: 0 },
    AAA: { total: 0, passing: 0, failing: 0 },
  };

  for (const [, { level, passing }] of criteriaStatus) {
    breakdown[level].total++;
    if (passing) {
      breakdown[level].passing++;
    } else {
      breakdown[level].failing++;
    }
  }

  return breakdown;
}

export function mapAxeResultToPayload(
  axeResults: AxeResults,
  auditedInput: string
): AuditPayload {
  const issues: Issue[] = axeResults.violations.map((violation): Issue => {
    const firstNode = violation.nodes[0];
    const { criterion, level } = extractWcagCriterion(violation);

    return {
      id: violation.id,
      wcagCriterion: criterion,
      wcagCriterionName: violation.help,
      wcagLevel: level,
      principle: PRINCIPLE_MAP[violation.id] ?? 'robust',
      severity: IMPACT_MAP[violation.impact ?? 'minor'],
      description: violation.description,
      fixSuggestion:
        firstNode?.failureSummary?.replace('Fix any of the following: ', '') ??
        violation.help,
      helpUrl: violation.helpUrl,
      codeSnippet: firstNode ? axeNodeToCodeSnippet(firstNode) : '',
      codeFixExample: '', // axe-core does not provide fix examples; empty string
      affectedCount: violation.nodes.length,
      hasBeforeAfter: false, // live axe results don't have before/after demos
    };
  });

  const levelBreakdown = calculateLevelBreakdownFromAxe(issues, axeResults.passes);
  const overallScore = calculateOverallScore(levelBreakdown);

  return {
    id: generateId(),
    auditedInput,
    auditedAt: new Date().toISOString(),
    source: 'live-axe',
    overallScore,
    grade: calculateGrade(overallScore),
    levelBreakdown,
    principleBreakdown: buildPrincipleBreakdown(issues),
    issues,
    passingCriteria: axeResults.passes.map((p) => ({
      wcagCriterion: p.id,
      wcagCriterionName: p.help,
      wcagLevel: 'AA' as WcagLevel,
      principle: PRINCIPLE_MAP[p.id] ?? 'robust',
    })),
    totalElements:
      axeResults.violations.reduce((sum, v) => sum + v.nodes.length, 0) +
      axeResults.passes.reduce((sum, p) => sum + p.nodes.length, 0),
  };
}
