/**
 * TypeScript Data Schemas — AccessLens
 * Complete type contract for the entire application
 */

// ============================================
// Primitive Type Aliases
// ============================================

export type WcagLevel = 'A' | 'AA' | 'AAA';
export type IssueSeverity = 'critical' | 'serious' | 'moderate' | 'minor';
export type WcagPrinciple = 'perceivable' | 'operable' | 'understandable' | 'robust';
export type AuditSource = 'mock' | 'live-axe';
export type ConfidenceLevel = 'confirmed' | 'likely' | 'review';
export type ImpairmentKey =
  | 'none'
  | 'achromatopsia'
  | 'deuteranopia'
  | 'protanopia'
  | 'tritanopia'
  | 'macular';
export type BeforeAfterType = 'contrast' | 'alt-text' | 'touch-target';
export type SortMode = 'severity' | 'criterion' | 'count';
export type ViewState = 'idle' | 'loading' | 'results';
export type InputMode = 'url' | 'html' | 'alt-text';

// ============================================
// AuditPayload — Root Result Object
// ============================================

export interface AuditPayload {
  id: string;
  auditedInput: string;
  auditedAt: string;
  source: AuditSource;
  scanMode?: InputMode; // Set by auditEngine after mapping
  overallScore: number;
  grade: WcagLevel | 'Fail';
  levelBreakdown: LevelBreakdown;
  principleBreakdown: PrincipleBreakdown;
  issues: Issue[];
  passingCriteria: PassingCriterion[];
  totalElements: number;
  isFallback?: boolean;
}

// ============================================
// LevelBreakdown
// ============================================

export interface LevelBreakdownEntry {
  total: number;
  passing: number;
  failing: number;
}

export interface LevelBreakdown {
  A: LevelBreakdownEntry;
  AA: LevelBreakdownEntry;
  AAA: LevelBreakdownEntry;
}

// ============================================
// PrincipleBreakdown
// ============================================

export interface PrincipleSummary {
  total: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
}

export interface PrincipleBreakdown {
  perceivable: PrincipleSummary;
  operable: PrincipleSummary;
  understandable: PrincipleSummary;
  robust: PrincipleSummary;
}

// ============================================
// Issue — Individual Violation
// ============================================

export interface Issue {
  id: string;
  ruleId: string; // axe-core rule ID for confidence lookup and dismissal
  wcagCriterion: string;
  wcagCriterionName: string;
  wcagLevel: WcagLevel;
  principle: WcagPrinciple;
  severity: IssueSeverity;
  description: string;
  fixSuggestion: string;
  helpUrl: string;
  codeSnippet: string;
  codeFixExample: string;
  affectedCount: number;
  hasBeforeAfter: boolean;
  beforeAfterType?: BeforeAfterType;
}

// ============================================
// PassingCriterion
// ============================================

export interface PassingCriterion {
  wcagCriterion: string;
  wcagCriterionName: string;
  wcagLevel: WcagLevel;
  principle: WcagPrinciple;
}

// ============================================
// Heatmap Types
// ============================================

export interface HeatmapCell {
  principle: WcagPrinciple;
  severity: IssueSeverity;
  count: number;
  topViolationId: string | null;
  topViolationName: string | null;
}

export type HeatmapGrid = HeatmapCell[][];

// ============================================
// ImpairmentFilter
// ============================================

export interface ImpairmentFilter {
  key: ImpairmentKey;
  label: string;
  description: string;
  prevalence: string;
  filterId: string;
  svgFilter: string | null;
  cssClass: string | null;
}

// ============================================
// AuditInput — Engine Entry Type
// ============================================

export interface AuditInput {
  mode: InputMode;
  value: string;
  css?: string; // Optional CSS for HTML mode analysis
}

// ============================================
// HeatmapFilter — Active Cell Filter State
// ============================================

export interface HeatmapFilter {
  principle: WcagPrinciple;
  severity: IssueSeverity;
}
