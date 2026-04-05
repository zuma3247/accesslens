# React Composition Patterns for AccessLens

A structured repository of React composition patterns tailored for the AccessLens WCAG accessibility dashboard.

## Purpose

These patterns help avoid boolean prop proliferation in the AccessLens components by using compound components, lifting state, and composing internals. Particularly useful for:

- Issue Card components (collapsed, expanded, compact variants)
- Emulation Widget (vision filter controls)
- Results Dashboard (filter, heatmap, issue list coordination)

## Structure

- `SKILL.md` - Skill definition and quick reference
- `AGENTS.md` - Complete compiled guide with all rules expanded
- `metadata.json` - Document metadata

## Rule Categories

| Priority | Category | Impact | Count |
|----------|----------|--------|-------|
| 1 | Component Architecture | HIGH | 2 rules |
| 2 | State Management | MEDIUM | 2 rules |
| 3 | Implementation Patterns | MEDIUM | 2 rules |

## AccessLens-Specific Patterns

### Compound Components (ARCHITECTURE-2)

The EmulationWidget and IssueCard components use compound component patterns:

```tsx
<Emulation.Provider>
  <Emulation.Widget />
</Emulation.Provider>
```

### State Lifting (STATE-1)

Audit results state is lifted to providers so siblings can access it:

```tsx
<ResultsProvider auditResult={auditResult}>
  <FilterBar />
  <Heatmap />
  <IssueCardList />
  <RightPanel />
</ResultsProvider>
```

### Explicit Variants (PATTERNS-1)

Instead of boolean props, create explicit components:

```tsx
// Not: <IssueCard isExpanded isCompact />
// But:
<ExpandedIssueCard issue={issue} />
<CompactIssueCard issue={issue} />
```

## Core Principles

1. **Composition over configuration** — Let consumers compose subcomponents
2. **Lift your state** — State in providers, not trapped in components  
3. **Compose your internals** — Subcomponents access context, not props
4. **Explicit variants** — Create specific component variants, not generic with booleans

## How to Use

When working on AccessLens components:

1. Check if your component has >3 boolean props → use compound components
2. Check if siblings need shared state → lift to provider
3. Check for multiple visual modes → create explicit variants
4. Check for render props → prefer children composition

## References

- [React Context](https://react.dev/learn/passing-data-deeply-with-context)
- [React use() API](https://react.dev/reference/react/use)
