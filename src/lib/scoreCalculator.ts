import type { LevelBreakdown, WcagLevel } from '@/types/audit.types';

export function calculateOverallScore(breakdown: LevelBreakdown): number {
  // Score = % of A + AA criteria passing (AAA excluded from compliance score)
  const totalEvaluated = breakdown.A.total + breakdown.AA.total;
  const totalPassing = breakdown.A.passing + breakdown.AA.passing;
  if (totalEvaluated === 0) return 100; // no criteria evaluated = vacuously pass
  return Math.round((totalPassing / totalEvaluated) * 100);
}

export function calculateGrade(score: number): WcagLevel | 'Fail' {
  if (score >= 90) return 'AAA';
  if (score >= 75) return 'AA';
  if (score >= 60) return 'A';
  return 'Fail';
}
