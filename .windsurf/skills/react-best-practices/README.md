# React Best Practices for AccessLens

A structured repository of React performance optimization guidelines tailored for the AccessLens WCAG accessibility dashboard.

## Structure

- `SKILL.md` - Skill definition and quick reference
- `AGENTS.md` - Complete compiled guide with all rules
- `metadata.json` - Document metadata

## Rule Categories

| Priority | Category | Impact | Count |
|----------|----------|--------|-------|
| 1 | Accessibility-Specific | HIGH | 3 rules |
| 2 | Eliminating Waterfalls | CRITICAL | 1 rule |
| 3 | Bundle Size Optimization | CRITICAL | 2 rules |
| 4 | State Management | MEDIUM | 1 rule |
| 5 | Re-render Optimization | MEDIUM | 1 rule |
| 6 | Rendering Performance | MEDIUM | 1 rule |
| 7 | JavaScript Performance | LOW-MEDIUM | 2 rules |

## AccessLens-Specific Patterns

### Animation Performance (A11Y-1, A11Y-2)

The Score Ring and other animated components must:
1. Animate wrapper divs, not SVG elements directly
2. Always respect `prefers-reduced-motion` via `useReducedMotion()`

### Bundle Optimization (BUNDLE-1)

Direct icon imports from `lucide-react` are required:
```tsx
import Check from 'lucide-react/dist/esm/icons/check';
```

Not:
```tsx
import { Check } from 'lucide-react'; // Don't do this
```

### Component Checklist

When modifying AccessLens components, verify against:

- **ScoreRing**: A11Y-1 (SVG wrapper), A11Y-2 (reduced motion)
- **IssueCard**: RERENDER-1 (memo), A11Y-2 (reduced motion)
- **Heatmap**: JS-1 (cached scale), A11Y-3 (passive events)
- **EmulationWidget**: A11Y-2 (reduced motion)
- **BeforeAfterPanel**: BUNDLE-2 (dynamic import)

## How to Use

When working on AccessLens React code:

1. Identify the component you're modifying
2. Check the Component Quick Reference in `AGENTS.md`
3. Apply relevant rules from the appropriate category
4. Ensure animations use `useReducedMotion()`
5. Verify icon imports are direct, not barrel imports

## References

- [React Documentation](https://react.dev)
- [Framer Motion](https://www.framer.com/motion)
- [D3 Scale](https://github.com/d3/d3-scale)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
