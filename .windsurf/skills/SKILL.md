---
name: accesslens-skills-index
description: Complete skill index for the AccessLens WCAG Accessibility Dashboard. Aggregates all project-specific skills for React performance optimization and component composition patterns. Use this as the entry point when working on any AccessLens code.
license: MIT
metadata:
  author: AccessLens
  version: "1.0.0"
  project: AccessLens WCAG Accessibility Dashboard
---

# AccessLens Skills Index

Complete skill collection for the AccessLens WCAG Accessibility Dashboard project.

## Available Skills

### 1. React Best Practices (`react-best-practices/`)

**When to use:** Writing, reviewing, or refactoring React code in AccessLens.

**Coverage:**
- Animation performance (Score Ring, Issue Cards)
- Bundle optimization (icon imports, dynamic imports)
- Reduced motion compliance (WCAG requirement)
- State management patterns
- Rendering optimization

**Key Rules:**
- A11Y-1: Animate SVG wrapper, not SVG element
- A11Y-2: Use useReducedMotion for all animations
- BUNDLE-1: Direct icon imports from lucide-react
- STATE-1: Context interface for Theme

### 2. Composition Patterns (`composition-patterns/`)

**When to use:** Refactoring components, building flexible component APIs, designing compound components.

**Coverage:**
- Compound components (IssueCard, EmulationWidget)
- State lifting (Results Dashboard)
- Explicit component variants
- Children over render props

**Key Rules:**
- ARCHITECTURE-1: Avoid boolean props in Issue Cards
- ARCHITECTURE-2: Use compound components
- STATE-1: Lift state into provider components
- PATTERNS-1: Create explicit component variants

## Quick Component Reference

When modifying these AccessLens components, consult the relevant skills:

| Component | Primary Skill | Key Rules |
|-----------|--------------|-----------|
| `ScoreRing` | react-best-practices | A11Y-1, A11Y-2 |
| `IssueCard` | composition-patterns | ARCHITECTURE-1, ARCHITECTURE-2 |
| `Heatmap` | react-best-practices | JS-1, A11Y-3 |
| `EmulationWidget` | composition-patterns | ARCHITECTURE-2 |
| `BeforeAfterPanel` | react-best-practices | BUNDLE-2, A11Y-2 |
| `ResultsDashboard` | composition-patterns | STATE-1, STATE-2 |
| `FilterBar` | composition-patterns | STATE-2 |
| `InputPanel` | react-best-practices | ASYNC-1 |
| `ThemeToggle` | react-best-practices | STATE-1 |

## File Locations

```
.windsurf/skills/
├── react-best-practices/
│   ├── SKILL.md          # Quick reference
│   ├── AGENTS.md         # Full guide
│   ├── README.md         # Overview
│   └── metadata.json     # Document metadata
├── composition-patterns/
│   ├── SKILL.md          # Quick reference
│   ├── AGENTS.md         # Full guide
│   ├── README.md         # Overview
│   └── metadata.json     # Document metadata
└── SKILL.md              # This index file
```

## Usage Flowchart

```
Working on AccessLens code?
│
├─→ Animations/Performance?
│   └─→ Read react-best-practices/SKILL.md
│
├─→ Component Structure/State?
│   └─→ Read composition-patterns/SKILL.md
│
├─→ Both needed?
│   └─→ Read both, start with composition-patterns
│
└─→ Unsure?
    └─→ Check Quick Component Reference above
```

## Project Context

**AccessLens** is a React-based WCAG accessibility compliance dashboard with these key characteristics:

- **Stack:** React 18.2, TypeScript, Vite, TailwindCSS, Framer Motion
- **Accessibility:** axe-core integration, visual impairment emulation engine
- **Features:** Score Ring, Heatmap, Issue Cards, AI Fix Prompt Generator
- **Compliance:** WCAG 2.2 AA, prefers-reduced-motion support
- **Bundle:** <500KB target, direct icon imports required

## References

- Project PRD: `PRD.md`
- Tech Stack: `TECH_STACK.md`
- Frontend Guidelines: `FRONTEND_GUIDELINES.md`
- Backend Structure: `BACKEND_STRUCTURE.md`
