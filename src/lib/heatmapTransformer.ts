import type { Issue, HeatmapGrid, HeatmapCell, WcagPrinciple, IssueSeverity } from '@/types/audit.types';

const PRINCIPLES: WcagPrinciple[] = ['perceivable', 'operable', 'understandable', 'robust'];
const SEVERITIES: IssueSeverity[] = ['critical', 'serious', 'moderate', 'minor'];

export function transformToHeatmap(issues: Issue[]): HeatmapGrid {
  // Initialize 4x4 grid with zero counts
  const grid: HeatmapGrid = PRINCIPLES.map((principle) =>
    SEVERITIES.map((severity): HeatmapCell => ({
      principle,
      severity,
      count: 0,
      topViolationId: null,
      topViolationName: null,
    }))
  );

  // Aggregate issues into cells
  for (const issue of issues) {
    const principleIndex = PRINCIPLES.indexOf(issue.principle);
    const severityIndex = SEVERITIES.indexOf(issue.severity);

    if (principleIndex === -1 || severityIndex === -1) continue;

    const cell = grid[principleIndex][severityIndex];
    cell.count += issue.affectedCount;

    // Track top violation by affected count
    if (!cell.topViolationId || issue.affectedCount > getTopViolationCount(issues, cell.topViolationId)) {
      cell.topViolationId = issue.id;
      cell.topViolationName = issue.wcagCriterionName;
    }
  }

  return grid;
}

function getTopViolationCount(issues: Issue[], violationId: string | null): number {
  if (!violationId) return 0;
  const issue = issues.find((i) => i.id === violationId);
  return issue?.affectedCount ?? 0;
}

export function buildPrincipleBreakdown(issues: Issue[]) {
  const breakdown = {
    perceivable: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 },
    operable: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 },
    understandable: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 },
    robust: { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 },
  };

  for (const issue of issues) {
    const principle = breakdown[issue.principle];
    if (principle) {
      principle.total += issue.affectedCount;
      principle[issue.severity] += issue.affectedCount;
    }
  }

  return breakdown;
}
