// Vitest tests for Before/After functionality
import { describe, it, expect } from 'vitest';
import { getDemoContent } from '@/lib/beforeAfterContent';
import type { Issue } from '@/types/audit.types';

import type { ContrastDemoProps, AltTextDemoProps, TouchTargetDemoProps } from '@/lib/beforeAfterContent';

// Mock issue data for testing
const mockContrastIssue: Issue = {
  id: 'test-contrast',
  wcagCriterion: '1.4.3',
  wcagCriterionName: 'Contrast (Minimum)',
  wcagLevel: 'AA',
  principle: 'perceivable',
  severity: 'serious',
  description: 'Test contrast issue',
  fixSuggestion: 'Increase contrast',
  helpUrl: 'https://example.com',
  codeSnippet: '<span style="color: #AAAAAA">Test text</span>',
  codeFixExample: '<span style="color: #595959">Test text</span>',
  affectedCount: 1,
  hasBeforeAfter: true,
  beforeAfterType: 'contrast'
};

const mockAltTextIssue: Issue = {
  ...mockContrastIssue,
  id: 'test-alt-text',
  beforeAfterType: 'alt-text',
  codeSnippet: '<img src="test.jpg" alt="">',
  codeFixExample: '<img src="test.jpg" alt="Test image description">'
};

const mockTouchTargetIssue: Issue = {
  ...mockContrastIssue,
  id: 'test-touch-target',
  beforeAfterType: 'touch-target',
  codeSnippet: '<button style="width: 18px; height: 18px">×</button>',
  codeFixExample: '<button style="width: 24px; height: 24px">×</button>'
};

describe('getDemoContent', () => {
  it('returns null for issues without before/after', () => {
    const noBeforeAfterIssue = { ...mockContrastIssue, hasBeforeAfter: false };
    const result = getDemoContent(noBeforeAfterIssue);
    expect(result).toBeNull();
  });

  it('returns null for issues without beforeAfterType', () => {
    const noTypeIssue = { ...mockContrastIssue, beforeAfterType: undefined as unknown as undefined };
    const result = getDemoContent(noTypeIssue as unknown as Issue);
    expect(result).toBeNull();
  });

  describe('contrast type', () => {
    it('generates contrast demo content with failing and passing colors', () => {
      const content = getDemoContent(mockContrastIssue);
      expect(content).not.toBeNull();
      expect(content).toHaveProperty('failingColor');
      expect(content).toHaveProperty('passingColor');
      expect(content).toHaveProperty('failingRatio');
      expect(content).toHaveProperty('passingRatio');
      expect(content).toHaveProperty('text');
      expect(content).toHaveProperty('criterionNote');
    });

    it('extracts color from code snippet when available', () => {
      const content = getDemoContent(mockContrastIssue) as ContrastDemoProps;
      expect(content.failingColor).toBe('#AAAAAA');
      expect(content.passingColor).toBe('#595959');
    });

    it('uses default colors when snippet does not contain color', () => {
      const issueWithoutColor = {
        ...mockContrastIssue,
        codeSnippet: '<span>Test text</span>',
        codeFixExample: '<span>Test text</span>'
      };
      const content = getDemoContent(issueWithoutColor) as ContrastDemoProps;
      expect(content.failingColor).toBe('#999999');
      expect(content.passingColor).toBe('#767676');
    });

    it('extracts text from code snippet when available', () => {
      const content = getDemoContent(mockContrastIssue) as ContrastDemoProps;
      expect(content.text).toBe('Test text');
    });
  });

  describe('alt-text type', () => {
    it('generates alt-text demo content with failing and passing alt text', () => {
      const content = getDemoContent(mockAltTextIssue);
      expect(content).not.toBeNull();
      expect(content).toHaveProperty('failingAlt');
      expect(content).toHaveProperty('passingAlt');
      expect(content).toHaveProperty('imageDescription');
    });

    it('has descriptive alt text in passing state', () => {
      const content = getDemoContent(mockAltTextIssue) as AltTextDemoProps;
      expect(content.passingAlt).toContain('Bar chart');
      expect(content.passingAlt).toContain('EMEA');
    });
  });

  describe('touch-target type', () => {
    it('generates touch-target demo content with size specifications', () => {
      const content = getDemoContent(mockTouchTargetIssue);
      expect(content).not.toBeNull();
      expect(content).toHaveProperty('failingSize');
      expect(content).toHaveProperty('passingSize');
      expect(content).toHaveProperty('label');
    });

    it('has failing size smaller than passing size', () => {
      const content = getDemoContent(mockTouchTargetIssue) as TouchTargetDemoProps;
      const failingArea = content.failingSize.width * content.failingSize.height;
      const passingArea = content.passingSize.width * content.passingSize.height;
      expect(failingArea).toBeLessThan(passingArea);
    });

    it('passing size meets WCAG minimum (24x24px)', () => {
      const content = getDemoContent(mockTouchTargetIssue) as TouchTargetDemoProps;
      expect(content.passingSize.width).toBeGreaterThanOrEqual(24);
      expect(content.passingSize.height).toBeGreaterThanOrEqual(24);
    });
  });
});
