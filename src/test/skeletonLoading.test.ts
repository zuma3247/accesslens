import { createElement } from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProgressMessages } from '@/components/skeleton/ProgressMessages';
import { SkeletonDashboard } from '@/components/skeleton/SkeletonDashboard';

const MESSAGES = [
  'Analyzing accessibility...',
  'Checking contrast ratios...',
  'Validating semantic HTML...',
  'Scanning keyboard navigation...',
  'Evaluating ARIA usage...',
  'Testing touch target sizes...',
  'Processing results...',
];

const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe('Skeleton loading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders a stable screen-reader status message', () => {
    render(createElement(ProgressMessages));

    expect(screen.getByRole('status').textContent).toContain('Accessibility scan in progress. Please wait.');
    expect(screen.getByText(MESSAGES[0])).toBeTruthy();
  });

  it('cycles visible progress messages every 400ms', () => {
    render(createElement(ProgressMessages));

    expect(screen.getByText(MESSAGES[0])).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByText(MESSAGES[1])).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(400 * (MESSAGES.length - 1));
    });
    expect(screen.getByText(MESSAGES[0])).toBeTruthy();
  });

  it('renders expected skeleton dashboard sections', () => {
    render(createElement(SkeletonDashboard));

    expect(screen.getByText('Level Breakdown')).toBeTruthy();
    expect(screen.getByText('Issue Heatmap')).toBeTruthy();
    expect(screen.getByText('Issue Detail')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Accessibility scan in progress. Please wait.');
  });
});
