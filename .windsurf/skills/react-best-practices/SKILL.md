---
name: accesslens-react-best-practices
description: React performance optimization guidelines tailored for AccessLens. Use when writing, reviewing, or refactoring React code in the AccessLens accessibility dashboard to ensure optimal performance patterns. Triggers on tasks involving React components, data fetching, bundle optimization, animation performance with Framer Motion, or state management.
license: MIT
metadata:
  author: AccessLens (adapted from Vercel Engineering)
  version: "1.0.0"
  project: AccessLens WCAG Accessibility Dashboard
---

# AccessLens React Best Practices

Performance optimization guide for the AccessLens React application. Contains rules across 8 categories, prioritized by impact to guide refactoring and code generation.

## When to Apply

Reference these guidelines when:
- Writing new React components for the accessibility dashboard
- Implementing data fetching for audit results
- Reviewing code for performance issues
- Refactoring components (Issue cards, Score Ring, Heatmap, Emulation Widget)
- Optimizing Framer Motion animations
- Working with axe-core integration

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` |
| 3 | Animation Performance | HIGH | `animation-` |
| 4 | Re-render Optimization | MEDIUM | `rerender-` |
| 5 | Rendering Performance | MEDIUM | `rendering-` |
| 6 | State Management | MEDIUM | `state-` |
| 7 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 8 | Accessibility-Specific | HIGH | `a11y-` |

## AccessLens-Specific Patterns

### A11Y-1: Animate SVG Wrapper, Not SVG Element

**Impact: HIGH (prevents animation jank in Score Ring)**

When animating the Score Ring component, apply Framer Motion animations to a wrapper `div` rather than the SVG elements directly. SVG coordinate precision changes cause unnecessary recalculations.

**Incorrect: Animate SVG directly**
```tsx
<motion.circle
  animate={{ strokeDashoffset: value }}
  transition={{ duration: 0.8 }}
/>
```

**Correct: Animate wrapper, static SVG**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  <svg>
    <circle strokeDashoffset={calculatedValue} />
  </svg>
</motion.div>
```

**Reference:** See Score Ring implementation in `src/components/ScoreRing.tsx`

---

### A11Y-2: Use useReducedMotion for All Animations

**Impact: CRITICAL (accessibility requirement per PRD Section 8)**

All Framer Motion animations must respect `prefers-reduced-motion`. The PRD requires all animations to be disabled when this media query matches.

**Incorrect: Animation always plays**
```tsx
<motion.div
  animate={{ height: 'auto' }}
  transition={{ duration: 0.3 }}
/>
```

**Correct: Respects reduced motion preference**
```tsx
const shouldReduce = useReducedMotion();

<motion.div
  animate={{ height: 'auto' }}
  transition={shouldReduce ? { duration: 0 } : { duration: 0.3 }}
/>
```

**Required in:** Score Ring, Issue Card expand/collapse, Before/After panel, Emulation Widget

---

### A11Y-3: Passive Event Listeners for Heatmap Interactions

**Impact: MEDIUM (scroll performance)**

When adding scroll or touch event listeners to the heatmap or issue cards list, use passive listeners to prevent blocking the main thread.

**Incorrect: Blocking scroll**
```tsx
useEffect(() => {
  element.addEventListener('scroll', handleScroll);
}, []);
```

**Correct: Passive listener**
```tsx
useEffect(() => {
  element.addEventListener('scroll', handleScroll, { passive: true });
}, []);
```

---

### ASYNC-1: Parallel Data Loading for Mock Audits

**Impact: CRITICAL (2-10× improvement in mock data loading)**

When loading mock audit profiles (ecommerce, dashboard, healthcare, login, clean), fetch them in parallel rather than sequentially.

**Incorrect: Sequential loading**
```tsx
const ecommerce = await import('@/data/seeds/ecommerce.json');
const dashboard = await import('@/data/seeds/dashboard.json');
```

**Correct: Parallel loading**
```tsx
const [ecommerce, dashboard, healthcare, login, clean] = await Promise.all([
  import('@/data/seeds/ecommerce.json'),
  import('@/data/seeds/dashboard.json'),
  import('@/data/seeds/healthcare.json'),
  import('@/data/seeds/login.json'),
  import('@/data/seeds/clean.json'),
]);
```

---

### BUNDLE-1: Direct Icon Imports from lucide-react

**Impact: CRITICAL (reduces bundle by ~800KB)**

AccessLens uses `lucide-react` extensively. Import icons directly from their source files to avoid loading the entire library.

**Incorrect: Barrel import**
```tsx
import { Check, X, Menu, Loader2, ChevronDown } from 'lucide-react';
```

**Correct: Direct import**
```tsx
import Check from 'lucide-react/dist/esm/icons/check';
import X from 'lucide-react/dist/esm/icons/x';
import Menu from 'lucide-react/dist/esm/icons/menu';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
```

**Note:** Vite doesn't automatically optimize package imports like Next.js. Manual direct imports are required.

---

### BUNDLE-2: Dynamic Import for Before/After Panel

**Impact: HIGH (reduces initial bundle)**

The Before/After remediation panel is only shown when a user clicks "View Before/After" on specific issue types. Lazy load this heavy component.

**Implementation:**
```tsx
const BeforeAfterPanel = lazy(() => import('@/components/BeforeAfterPanel'));

// In component
<Suspense fallback={<Skeleton height={200} />}>
  {showBeforeAfter && <BeforeAfterPanel type={beforeAfterType} />}
</Suspense>
```

---

### STATE-1: Context Interface for Theme (Already Implemented)

**Impact: MEDIUM (consistent with existing pattern)**

The existing `ThemeContext` in `src/context/ThemeContext.tsx` follows the correct pattern. When consuming:

**Correct usage:**
```tsx
const { theme, toggleTheme } = useTheme();
```

**Do not:** Access `localStorage` directly from components. Always go through the context.

---

### RERENDER-1: Memoize Issue Card List

**Impact: MEDIUM (prevents unnecessary re-renders during filtering)**

The Issue Cards list re-renders when filters change. Memoize individual cards to prevent re-rendering unaffected issues.

**Implementation:**
```tsx
const IssueCard = memo(function IssueCard({ issue, onExpand }: IssueCardProps) {
  // Component implementation
});

// In parent
const filteredIssues = useMemo(() => 
  issues.filter(applyFilters),
  [issues, filters]
);
```

---

### RENDERING-1: CSS content-visibility for Long Issue Lists

**Impact: MEDIUM (improves rendering performance for 24+ issues)**

When displaying many issue cards, use CSS `content-visibility: auto` to skip rendering off-screen content.

**Implementation:**
```tsx
// In IssueCard.tsx or parent container
<div className="content-visibility-auto">
  {/* Issue card content */}
</div>
```

**Add to globals.css:**
```css
.content-visibility-auto {
  content-visibility: auto;
  contain-intrinsic-size: auto 300px;
}
```

---

### JS-1: Cache Heatmap Color Scale

**Impact: LOW-MEDIUM (avoid recalculating d3-scale)**

The heatmap color scale only needs to be rebuilt when the max issue count changes. Cache it with `useMemo`.

**Incorrect: Recalculates every render**
```tsx
const colorScale = buildHeatmapScale(maxCount);
```

**Correct: Memoized scale**
```tsx
const colorScale = useMemo(
  () => buildHeatmapScale(maxCount),
  [maxCount]
);
```

---

### JS-2: Use Map for Issue ID Lookups

**Impact: LOW-MEDIUM (O(1) lookups vs O(n) scans)**

When finding issues by ID (e.g., for the heatmap click-to-filter feature), use a Map instead of array.find().

**Incorrect: Linear scan**
```tsx
const issue = issues.find(i => i.id === selectedId);
```

**Correct: Map lookup**
```tsx
const issueMap = useMemo(() => {
  const map = new Map();
  issues.forEach(i => map.set(i.id, i));
  return map;
}, [issues]);

const issue = issueMap.get(selectedId);
```

---

## Quick Reference: AccessLens Component Checklist

When modifying these components, check against relevant rules:

| Component | Critical Rules |
|-------------|----------------|
| `ScoreRing` | A11Y-1 (SVG wrapper), A11Y-2 (reduced motion) |
| `IssueCard` | RERENDER-1 (memo), A11Y-2 (reduced motion) |
| `Heatmap` | JS-1 (cached scale), A11Y-3 (passive events) |
| `EmulationWidget` | A11Y-2 (reduced motion) |
| `BeforeAfterPanel` | BUNDLE-2 (dynamic import), A11Y-2 (reduced motion) |
| `InputPanel` | ASYNC-1 (parallel loading) |
| `FilterBar` | RERENDER-1 (memoized callbacks) |
| All Icons | BUNDLE-1 (direct imports) |

---

## File References

- Score Ring: `src/components/results/ScoreRing.tsx`
- Issue Cards: `src/components/results/IssueCard.tsx`
- Heatmap: `src/components/results/Heatmap.tsx`
- Emulation Widget: `src/components/emulation/EmulationWidget.tsx`
- Theme Context: `src/context/ThemeContext.tsx`
- Prompt Generator: `src/lib/promptGenerator.ts`

---

## Full Compiled Document

For the complete guide: `AGENTS.md`
