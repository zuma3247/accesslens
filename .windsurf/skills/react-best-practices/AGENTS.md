# AccessLens React Best Practices

**Version 1.0.0**  
AccessLens WCAG Accessibility Dashboard  
April 2026

> **Note:**  
> This document is for AI agents and LLMs working on the AccessLens codebase. It contains
> project-specific adaptations of general React best practices for the accessibility dashboard.

---

## Abstract

Performance optimization guide tailored for the AccessLens React application. Focuses on patterns
specific to accessibility dashboards, Framer Motion animations, axe-core integration, and the
unique component architecture (Score Ring, Heatmap, Issue Cards, Emulation Widget).

---

## Table of Contents

1. [Accessibility-Specific Patterns](#1-accessibility-specific-patterns) — **HIGH**
   - 1.1 [Animate SVG Wrapper, Not SVG Element](#11-animate-svg-wrapper-not-svg-element)
   - 1.2 [Use useReducedMotion for All Animations](#12-use-usereducedmotion-for-all-animations)
   - 1.3 [Passive Event Listeners for Heatmap](#13-passive-event-listeners-for-heatmap)
2. [Eliminating Waterfalls](#2-eliminating-waterfalls) — **CRITICAL**
   - 2.1 [Parallel Data Loading for Mock Audits](#21-parallel-data-loading-for-mock-audits)
3. [Bundle Size Optimization](#3-bundle-size-optimization) — **CRITICAL**
   - 3.1 [Direct Icon Imports from lucide-react](#31-direct-icon-imports-from-lucide-react)
   - 3.2 [Dynamic Import for Before/After Panel](#32-dynamic-import-for-beforeafter-panel)
4. [State Management](#4-state-management) — **MEDIUM**
   - 4.1 [Context Interface for Theme](#41-context-interface-for-theme)
5. [Re-render Optimization](#5-re-render-optimization) — **MEDIUM**
   - 5.1 [Memoize Issue Card List](#51-memoize-issue-card-list)
6. [Rendering Performance](#6-rendering-performance) — **MEDIUM**
   - 6.1 [CSS content-visibility for Long Issue Lists](#61-css-content-visibility-for-long-issue-lists)
7. [JavaScript Performance](#7-javascript-performance) — **LOW-MEDIUM**
   - 7.1 [Cache Heatmap Color Scale](#71-cache-heatmap-color-scale)
   - 7.2 [Use Map for Issue ID Lookups](#72-use-map-for-issue-id-lookups)

---

## 1. Accessibility-Specific Patterns

**Impact: HIGH**

Patterns specific to the AccessLens accessibility requirements and WCAG compliance.

### 1.1 Animate SVG Wrapper, Not SVG Element

**Impact: HIGH (prevents animation jank in Score Ring)**

When animating the Score Ring component, apply Framer Motion animations to a wrapper `div` rather than the SVG elements directly. SVG coordinate precision changes cause unnecessary recalculations.

**Incorrect: Animate SVG directly**

```tsx
function ScoreRing({ score }: { score: number }) {
  return (
    <svg>
      <motion.circle
        animate={{ strokeDashoffset: calculateOffset(score) }}
        transition={{ duration: 0.8 }}
      />
    </svg>
  );
}
```

**Correct: Animate wrapper, static SVG**

```tsx
function ScoreRing({ score }: { score: number }) {
  const shouldReduce = useReducedMotion();
  const offset = calculateOffset(score);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={shouldReduce ? { duration: 0 } : { duration: 0.3 }}
    >
      <svg>
        <circle strokeDashoffset={offset} />
      </svg>
    </motion.div>
  );
}
```

**Why this matters:** SVG elements have many coordinate properties that trigger layout recalculations when animated. A wrapper div animates more efficiently using transform and opacity.

**Reference:** See Score Ring implementation in `src/components/results/ScoreRing.tsx`

---

### 1.2 Use useReducedMotion for All Animations

**Impact: CRITICAL (accessibility requirement per PRD Section 8)**

All Framer Motion animations must respect `prefers-reduced-motion`. The PRD requires all animations to be disabled when this media query matches.

**Incorrect: Animation always plays**

```tsx
function IssueCard({ issue }: IssueCardProps) {
  return (
    <motion.div
      layout
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Card content */}
    </motion.div>
  );
}
```

**Correct: Respects reduced motion preference**

```tsx
import { useReducedMotion, motion } from 'framer-motion';

function IssueCard({ issue }: IssueCardProps) {
  const shouldReduce = useReducedMotion();
  
  return (
    <motion.div
      layout
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      transition={shouldReduce 
        ? { duration: 0 } 
        : { duration: 0.3, ease: 'easeOut' }
      }
    >
      {/* Card content */}
    </motion.div>
  );
}
```

**Required in:**
- Score Ring animation
- Issue Card expand/collapse
- Before/After panel slide up
- Emulation Widget expand/collapse
- Heatmap cell hover effects
- Any custom Framer Motion usage

**Testing:** Enable "Reduce motion" in your OS accessibility settings and verify all animations complete instantly.

---

### 1.3 Passive Event Listeners for Heatmap Interactions

**Impact: MEDIUM (scroll performance)**

When adding scroll or touch event listeners to the heatmap or issue cards list, use passive listeners to prevent blocking the main thread.

**Incorrect: Blocking scroll**

```tsx
useEffect(() => {
  const element = heatmapRef.current;
  if (!element) return;
  
  const handleScroll = () => {
    // Scroll handling logic
  };
  
  element.addEventListener('scroll', handleScroll);
  
  return () => {
    element.removeEventListener('scroll', handleScroll);
  };
}, []);
```

**Correct: Passive listener**

```tsx
useEffect(() => {
  const element = heatmapRef.current;
  if (!element) return;
  
  const handleScroll = () => {
    // Scroll handling logic
  };
  
  element.addEventListener('scroll', handleScroll, { passive: true });
  
  return () => {
    element.removeEventListener('scroll', handleScroll);
  };
}, []);
```

**Note:** Passive listeners cannot call `preventDefault()`. If you need to prevent default behavior, you cannot use passive mode.

---

## 2. Eliminating Waterfalls

**Impact: CRITICAL**

Waterfalls are the #1 performance killer. Each sequential await adds latency.

### 2.1 Parallel Data Loading for Mock Audits

**Impact: CRITICAL (2-10× improvement in mock data loading)**

When loading mock audit profiles (ecommerce, dashboard, healthcare, login, clean), fetch them in parallel rather than sequentially.

**Incorrect: Sequential loading**

```typescript
async function loadSeeds() {
  const ecommerce = await import('@/data/seeds/ecommerce.json');
  const dashboard = await import('@/data/seeds/dashboard.json');
  const healthcare = await import('@/data/seeds/healthcare.json');
  const login = await import('@/data/seeds/login.json');
  const clean = await import('@/data/seeds/clean.json');
  
  return { ecommerce, dashboard, healthcare, login, clean };
}
```

**Correct: Parallel loading**

```typescript
async function loadSeeds() {
  const [ecommerce, dashboard, healthcare, login, clean] = await Promise.all([
    import('@/data/seeds/ecommerce.json'),
    import('@/data/seeds/dashboard.json'),
    import('@/data/seeds/healthcare.json'),
    import('@/data/seeds/login.json'),
    import('@/data/seeds/clean.json'),
  ]);
  
  return { ecommerce, dashboard, healthcare, login, clean };
}
```

**Alternative with Promise.allSettled for error resilience:**

```typescript
async function loadSeedsResilient() {
  const results = await Promise.allSettled([
    import('@/data/seeds/ecommerce.json'),
    import('@/data/seeds/dashboard.json'),
    import('@/data/seeds/healthcare.json'),
    import('@/data/seeds/login.json'),
    import('@/data/seeds/clean.json'),
  ]);
  
  return {
    ecommerce: results[0].status === 'fulfilled' ? results[0].value : null,
    dashboard: results[1].status === 'fulfilled' ? results[1].value : null,
    // ... etc
  };
}
```

---

## 3. Bundle Size Optimization

**Impact: CRITICAL**

Reducing initial bundle size improves Time to Interactive and Largest Contentful Paint.

### 3.1 Direct Icon Imports from lucide-react

**Impact: CRITICAL (reduces bundle by ~800KB)**

AccessLens uses `lucide-react` extensively for icons. Import icons directly from their source files to avoid loading the entire library.

**Incorrect: Barrel import (loads 1,583 modules)**

```tsx
import { Check, X, Menu, Loader2, ChevronDown, ClipboardCopy, Eye } from 'lucide-react';
```

**Correct: Direct import (loads only what you need)**

```tsx
import Check from 'lucide-react/dist/esm/icons/check';
import X from 'lucide-react/dist/esm/icons/x';
import Menu from 'lucide-react/dist/esm/icons/menu';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ClipboardCopy from 'lucide-react/dist/esm/icons/clipboard-copy';
import Eye from 'lucide-react/dist/esm/icons/eye';
```

**Bundle impact comparison:**
- Barrel import: ~1MB, ~1,583 modules
- Direct imports: ~2KB per icon, 3-10 modules

**Note:** Vite doesn't automatically optimize package imports like Next.js 13.5+. Manual direct imports are required for optimal bundle size.

**Common icons in AccessLens:**
- `check`, `x`, `menu`, `loader-2` - General UI
- `clipboard-copy`, `clipboard-check` - Copy prompt buttons
- `eye`, `eye-off` - Vision emulation widget
- `chevron-down`, `chevron-up` - Expand/collapse
- `sun`, `moon` - Theme toggle
- `external-link` - WCAG criterion links

---

### 3.2 Dynamic Import for Before/After Panel

**Impact: HIGH (reduces initial bundle)**

The Before/After remediation panel is only shown when a user clicks "View Before/After" on specific issue types (contrast, alt-text, touch-target). Lazy load this component.

**Implementation:**

```tsx
import { lazy, Suspense } from 'react';

const BeforeAfterPanel = lazy(() => import('@/components/results/BeforeAfterPanel'));

function IssueCard({ issue }: IssueCardProps) {
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  
  if (!issue.hasBeforeAfter) return null;
  
  return (
    <>
      <button onClick={() => setShowBeforeAfter(true)}>
        View Before/After
      </button>
      
      <Suspense fallback={<Skeleton height={200} />}>
        {showBeforeAfter && (
          <BeforeAfterPanel 
            type={issue.beforeAfterType} 
            onClose={() => setShowBeforeAfter(false)}
          />
        )}
      </Suspense>
    </>
  );
}
```

**Why this matters:** The Before/After panel contains heavy visualization components (contrast swatches, mock screen reader output, measurement overlays) that aren't needed for the initial dashboard view.

---

## 4. State Management

**Impact: MEDIUM**

Patterns for managing state in AccessLens components.

### 4.1 Context Interface for Theme

**Impact: MEDIUM (consistent with existing pattern)**

The existing `ThemeContext` in `src/context/ThemeContext.tsx` follows the correct pattern. When consuming or modifying:

**Correct usage:**

```tsx
import { useTheme } from '@/context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}
```

**Do NOT:**
- Access `localStorage` directly from components
- Read `window.matchMedia` directly in components
- Set `data-theme` attribute manually outside the context provider

**The context handles:**
- Initial read from `localStorage` or system preference
- Persistence to `localStorage` on change
- Setting `data-theme` on `<html>` element
- FOUC prevention via inline script in `index.html`

---

## 5. Re-render Optimization

**Impact: MEDIUM**

Prevent unnecessary React re-renders.

### 5.1 Memoize Issue Card List

**Impact: MEDIUM (prevents unnecessary re-renders during filtering)**

The Issue Cards list re-renders when filters change. Memoize individual cards to prevent re-rendering unaffected issues.

**Implementation:**

```tsx
import { memo, useMemo } from 'react';

// Memoize individual card
const IssueCard = memo(function IssueCard({ 
  issue, 
  isExpanded, 
  onExpand 
}: IssueCardProps) {
  return (
    <div className={cn('issue-card', isExpanded && 'expanded')}>
      {/* Card content */}
    </div>
  );
});

// In parent component
function IssueCardList({ issues, filters }: IssueListProps) {
  // Memoize filtered list
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (filters.severity && issue.severity !== filters.severity) return false;
      if (filters.principle && issue.principle !== filters.principle) return false;
      return true;
    });
  }, [issues, filters]);
  
  // Memoize sorted list
  const sortedIssues = useMemo(() => {
    return [...filteredIssues].sort((a, b) => {
      switch (filters.sortBy) {
        case 'severity':
          return severityWeight(b.severity) - severityWeight(a.severity);
        case 'criterion':
          return a.wcagCriterion.localeCompare(b.wcagCriterion);
        case 'count':
          return b.affectedCount - a.affectedCount;
        default:
          return 0;
      }
    });
  }, [filteredIssues, filters.sortBy]);
  
  return (
    <div className="issue-list">
      {sortedIssues.map(issue => (
        <IssueCard
          key={issue.id}
          issue={issue}
          isExpanded={expandedId === issue.id}
          onExpand={() => setExpandedId(issue.id)}
        />
      ))}
    </div>
  );
}
```

---

## 6. Rendering Performance

**Impact: MEDIUM**

Optimize browser rendering pipeline.

### 6.1 CSS content-visibility for Long Issue Lists

**Impact: MEDIUM (improves rendering performance for 24+ issues)**

When displaying many issue cards, use CSS `content-visibility: auto` to skip rendering off-screen content.

**Implementation:**

```tsx
// In IssueCard.tsx
function IssueCard({ issue }: IssueCardProps) {
  return (
    <div className="issue-card content-visibility-auto">
      {/* Card content */}
    </div>
  );
}
```

**Add to globals.css:**

```css
@layer utilities {
  .content-visibility-auto {
    content-visibility: auto;
    contain-intrinsic-size: auto 300px;
  }
}
```

**Trade-offs:**
- **Pros:** Faster initial render, lower memory usage
- **Cons:** Slight delay when scrolling to new cards, scrollbar size estimation may be slightly off

**Best for:** Dashboards with 20+ issue cards where not all are visible initially.

---

## 7. JavaScript Performance

**Impact: LOW-MEDIUM**

Optimize JavaScript execution.

### 7.1 Cache Heatmap Color Scale

**Impact: LOW-MEDIUM (avoid recalculating d3-scale)**

The heatmap color scale only needs to be rebuilt when the max issue count changes. Cache it with `useMemo`.

**Incorrect: Recalculates every render**

```tsx
function Heatmap({ issues }: HeatmapProps) {
  const grid = transformToGrid(issues);
  const maxCount = Math.max(...grid.flat());
  const colorScale = buildHeatmapScale(maxCount); // Recalculates every render!
  
  return (
    <table>
      {/* Render cells using colorScale */}
    </table>
  );
}
```

**Correct: Memoized scale**

```tsx
import { useMemo } from 'react';
import { scaleSequential } from 'd3-scale';
import { interpolateRgb } from 'd3-interpolate';

function buildHeatmapScale(maxCount: number) {
  return scaleSequential(
    interpolateRgb('hsl(220, 13%, 91%)', 'hsl(0, 72%, 45%)')
  ).domain([0, Math.max(maxCount, 1)]);
}

function Heatmap({ issues }: HeatmapProps) {
  const grid = transformToGrid(issues);
  const maxCount = Math.max(...grid.flat());
  
  const colorScale = useMemo(
    () => buildHeatmapScale(maxCount),
    [maxCount] // Only recalculates when maxCount changes
  );
  
  return (
    <table>
      {/* Render cells using colorScale */}
    </table>
  );
}
```

---

### 7.2 Use Map for Issue ID Lookups

**Impact: LOW-MEDIUM (O(1) lookups vs O(n) scans)**

When finding issues by ID (e.g., for the heatmap click-to-filter feature), use a Map instead of array.find().

**Incorrect: Linear scan (O(n))**

```tsx
function handleHeatmapClick(principle: string, severity: string) {
  // For every click, scans entire issues array
  const matchingIssues = issues.filter(i => 
    i.principle === principle && i.severity === severity
  );
  setFilteredIssues(matchingIssues);
}
```

**Correct: Map lookup (O(1))**

```tsx
function IssueDashboard({ issues }: { issues: Issue[] }) {
  // Build index once
  const issueMapByPrincipleSeverity = useMemo(() => {
    const map = new Map<string, Issue[]>();
    
    issues.forEach(issue => {
      const key = `${issue.principle}:${issue.severity}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(issue);
    });
    
    return map;
  }, [issues]);
  
  const handleHeatmapClick = (principle: string, severity: string) => {
    const key = `${principle}:${severity}`;
    const matchingIssues = issueMapByPrincipleSeverity.get(key) ?? [];
    setFilteredIssues(matchingIssues);
  };
  
  return (
    <Heatmap onCellClick={handleHeatmapClick} />
  );
}
```

**When to use:**
- Heatmap cell clicks that filter issues
- Looking up issue details by ID
- Any repeated lookups in a large array

---

## Component Quick Reference

When modifying these components, check against relevant rules:

| Component | Critical Rules | File Path |
|-----------|----------------|-----------|
| `ScoreRing` | A11Y-1 (SVG wrapper), A11Y-2 (reduced motion) | `src/components/results/ScoreRing.tsx` |
| `IssueCard` | RERENDER-1 (memo), A11Y-2 (reduced motion) | `src/components/results/IssueCard.tsx` |
| `Heatmap` | JS-1 (cached scale), A11Y-3 (passive events) | `src/components/results/Heatmap.tsx` |
| `EmulationWidget` | A11Y-2 (reduced motion) | `src/components/emulation/EmulationWidget.tsx` |
| `BeforeAfterPanel` | BUNDLE-2 (dynamic import), A11Y-2 (reduced motion) | `src/components/results/BeforeAfterPanel.tsx` |
| `InputPanel` | ASYNC-1 (parallel loading) | `src/components/input/InputPanel.tsx` |
| `FilterBar` | RERENDER-1 (memoized callbacks) | `src/components/results/FilterBar.tsx` |
| Theme Icons | BUNDLE-1 (direct imports) | All component files |

---

## References

1. [https://react.dev](https://react.dev)
2. [https://www.framer.com/motion](https://www.framer.com/motion)
3. [https://github.com/d3/d3-scale](https://github.com/d3/d3-scale)
4. [https://lucide.dev](https://lucide.dev)
5. [https://www.w3.org/WAI/WCAG22/quickref/](https://www.w3.org/WAI/WCAG22/quickref/)
