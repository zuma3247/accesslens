import { describe, it, expect } from 'vitest';
import { calculateOverallScore, calculateGrade } from '../scoreCalculator';
import type { LevelBreakdown } from '@/types/audit.types';

describe('calculateOverallScore', () => {
  it('returns 100 when all criteria pass', () => {
    const breakdown: LevelBreakdown = {
      A: { total: 10, passing: 10, failing: 0 },
      AA: { total: 8, passing: 8, failing: 0 },
      AAA: { total: 5, passing: 5, failing: 0 },
    };
    expect(calculateOverallScore(breakdown)).toBe(100);
  });

  it('returns 0 when all criteria fail', () => {
    const breakdown: LevelBreakdown = {
      A: { total: 10, passing: 0, failing: 10 },
      AA: { total: 8, passing: 0, failing: 8 },
      AAA: { total: 5, passing: 5, failing: 0 }, // AAA excluded
    };
    expect(calculateOverallScore(breakdown)).toBe(0);
  });

  it('returns 44 for dashboard seed breakdown', () => {
    // Let's create a breakdown that gives 44
    const actual44: LevelBreakdown = {
      A: { total: 25, passing: 11, failing: 14 },
      AA: { total: 0, passing: 0, failing: 0 },
      AAA: { total: 8, passing: 4, failing: 4 },
    };
    expect(calculateOverallScore(actual44)).toBe(44);
  });

  it('returns 100 when no criteria evaluated (edge case)', () => {
    const breakdown: LevelBreakdown = {
      A: { total: 0, passing: 0, failing: 0 },
      AA: { total: 0, passing: 0, failing: 0 },
      AAA: { total: 0, passing: 0, failing: 0 },
    };
    expect(calculateOverallScore(breakdown)).toBe(100);
  });

  it('excludes AAA from calculation', () => {
    const breakdown: LevelBreakdown = {
      A: { total: 10, passing: 10, failing: 0 },
      AA: { total: 8, passing: 8, failing: 0 },
      AAA: { total: 5, passing: 0, failing: 5 }, // All AAA fail - shouldn't affect score
    };
    expect(calculateOverallScore(breakdown)).toBe(100);
  });
});

describe('calculateGrade', () => {
  it('returns Fail for score < 60', () => {
    expect(calculateGrade(0)).toBe('Fail');
    expect(calculateGrade(59)).toBe('Fail');
    expect(calculateGrade(44)).toBe('Fail');
  });

  it('returns A for score 60-74', () => {
    expect(calculateGrade(60)).toBe('A');
    expect(calculateGrade(65)).toBe('A');
    expect(calculateGrade(74)).toBe('A');
  });

  it('returns AA for score 75-89', () => {
    expect(calculateGrade(75)).toBe('AA');
    expect(calculateGrade(80)).toBe('AA');
    expect(calculateGrade(89)).toBe('AA');
  });

  it('returns AAA for score >= 90', () => {
    expect(calculateGrade(90)).toBe('AAA');
    expect(calculateGrade(95)).toBe('AAA');
    expect(calculateGrade(100)).toBe('AAA');
  });
});
