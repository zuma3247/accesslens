import { calculateOverallScore, calculateGrade } from './scoreCalculator';
import type { LevelBreakdown } from '@/types/audit.types';

test('returns 100 when all criteria pass', () => {
  const breakdown: LevelBreakdown = {
    A: { total: 10, passing: 10, failing: 0 },
    AA: { total: 8, passing: 8, failing: 0 },
    AAA: { total: 5, passing: 5, failing: 0 },
  };
  expect(calculateOverallScore(breakdown)).toBe(100);
});

test('returns 0 when all criteria fail', () => {
  const breakdown: LevelBreakdown = {
    A: { total: 10, passing: 0, failing: 10 },
    AA: { total: 8, passing: 0, failing: 8 },
    AAA: { total: 5, passing: 5, failing: 0 },
  };
  expect(calculateOverallScore(breakdown)).toBe(0);
});

test('returns 44 for dashboard seed breakdown', () => {
  const actual44: LevelBreakdown = {
    A: { total: 25, passing: 11, failing: 14 },
    AA: { total: 0, passing: 0, failing: 0 },
    AAA: { total: 8, passing: 4, failing: 4 },
  };
  expect(calculateOverallScore(actual44)).toBe(44);
});

test('returns 100 when no criteria evaluated (edge case)', () => {
  const breakdown: LevelBreakdown = {
    A: { total: 0, passing: 0, failing: 0 },
    AA: { total: 0, passing: 0, failing: 0 },
    AAA: { total: 0, passing: 0, failing: 0 },
  };
  expect(calculateOverallScore(breakdown)).toBe(100);
});

test('excludes AAA from calculation', () => {
  const breakdown: LevelBreakdown = {
    A: { total: 10, passing: 10, failing: 0 },
    AA: { total: 8, passing: 8, failing: 0 },
    AAA: { total: 5, passing: 0, failing: 5 },
  };
  expect(calculateOverallScore(breakdown)).toBe(100);
});

test('returns Fail for score < 60', () => {
  expect(calculateGrade(0)).toBe('Fail');
  expect(calculateGrade(59)).toBe('Fail');
  expect(calculateGrade(44)).toBe('Fail');
});

test('returns A for score 60-74', () => {
  expect(calculateGrade(60)).toBe('A');
  expect(calculateGrade(65)).toBe('A');
  expect(calculateGrade(74)).toBe('A');
});

test('returns AA for score 75-89', () => {
  expect(calculateGrade(75)).toBe('AA');
  expect(calculateGrade(80)).toBe('AA');
  expect(calculateGrade(89)).toBe('AA');
});

test('returns AAA for score >= 90', () => {
  expect(calculateGrade(90)).toBe('AAA');
  expect(calculateGrade(95)).toBe('AAA');
  expect(calculateGrade(100)).toBe('AAA');
});
