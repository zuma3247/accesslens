# AccessLens

**WCAG Accessibility Compliance Dashboard** — A WWT UX Apprenticeship Design Challenge Prototype

> Transform accessibility auditing from a painful, multi-hour developer task into a 30-second design-team workflow.

---

## What is AccessLens?

AccessLens is a React web application that audits web pages and HTML snippets for WCAG 2.2 AA compliance. It provides:

- **Visual Compliance Score** — Animated score ring with color-coded thresholds
- **Issue Heatmap** — 4×4 matrix showing violations by WCAG principle × severity
- **Detailed Issue Cards** — Code snippets, fix suggestions, and one-click AI prompts
- **Visual Impairment Emulation** — Experience your interface through color blindness and low-vision filters
- **AI Fix Prompt Generator** — Copy structured prompts for any AI coding agent

### The Problem It Solves

- **95.9%** of websites fail basic WCAG 2 accessibility standards
- **~57%** of violations are caught by automated tools—AccessLens shows them visually
- Enterprise teams face **European Accessibility Act** (June 2025) and **ADA Title II** (April 2026) deadlines

AccessLens closes two critical gaps:

1. **The Empathy Gap** — Designers experience color-blindness and low-vision conditions live via SVG filters
2. **The Remediation Gap** — Developers get copy-paste-ready AI prompts with context, failing code, and fixes

---

## Quickstart

```bash
# Clone and install
git clone <repo-url>
cd accesslens
npm install

# Run dev server
npm run dev

# Open http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## Seed URLs for Demo

AccessLens ships with **5 pre-seeded audit profiles**. Click any quick-fill chip to load instantly:

| Seed | Scenario | Score | Key Issues |
|------|----------|-------|------------|
| `demo.accesslens.app/dashboard` | Enterprise analytics | **44%** | Color-only charts, missing alt text, broken focus order |
| `demo.accesslens.app/ecommerce` | Checkout flow | **61%** | 12 contrast failures, form labels, keyboard traps |
| `demo.accesslens.app/healthcare` | Patient portal | **78%** | Timeout warnings, fieldset legend |
| `demo.accesslens.app/login` | Auth screen | **92%** | 1 touch target too small |
| `demo.accesslens.app/clean` | Accessible reference | **98%** | 0 critical, 1 minor (✓ badge demo) |

**HTML Snippet Mode:** Paste raw HTML to run live axe-core analysis against your markup.

---

## Core Features

### Visual Impairment Emulation Engine

Experience accessibility barriers viscerally. Five simulations applied live via SVG color-matrix filters:

| Mode | Simulation | Prevalence | Design Insight |
|------|------------|------------|----------------|
| **Achromatopsia** | Complete color blindness | ~0.003% | Exposes color-only interfaces |
| **Deuteranopia** | Red-green (green-weak) | ~5% males | Most common; success/error states merge |
| **Protanopia** | Red-green (red-weak) | ~1% males | Red CTAs lose urgency |
| **Tritanopia** | Blue-yellow | ~0.008% | Chart legends break |
| **Macular Degeneration** | Central vision loss | ~11M Americans 60+ | Peripheral clear, center blurred via CSS gradient |

**Why this architecture matters:** The widget sits *outside* the filtered DOM tree (`#app-root`), so controls remain legible when filters are active.

### AI Fix Prompt Generator

Every issue card generates a structured prompt for any AI coding agent (Claude, Cursor, GitHub Copilot, etc.):

**Per-Issue Prompt includes:**
- WCAG Criterion context and conformance level
- Affected element count
- Current (failing) code snippet
- Plain-language violation description
- Fix suggestion with example code
- Instructions for the AI agent

**Batch "Copy All Critical Fixes":**
- Consolidates all critical violations into one prompt
- Saves developer time on multi-issue remediation
- Shows ✓ "No critical violations" badge when count = 0

**Prompt Template Location:** `src/lib/promptGenerator.ts` — adapt for your organization's coding standards.

---

## HCD Process Notes

### Pain Points Researched

1. **Designers** can't visualize accessibility failures—contrast ratios are abstract numbers
2. **Developers** lose 15–30 min per violation translating WCAG specs into code
3. **DesignOps** lack systemic visibility—issues appear scattered, not patterned

### User Personas

| Role | Need | How AccessLens Delivers |
|------|------|------------------------|
| **UX Designer** | Fast visual status signal | Score ring + heatmap triage |
| **Front-end Dev** | Actionable code guidance | One-click AI prompts |
| **DesignOps Lead** | Systemic pattern visibility | Heatmap reveals cross-cutting failures |

### Prioritization Decisions

- **MVP Scope:** 24-hour build feasibility; single-page/snippet only
- **Out of Scope v1:** Live URL crawling (CORS), PDF export, Figma plugin, CI/CD integration
- **Differentiation:** Emulation engine + prompt generator as "Art of the Possible" centerpieces

---

## Accessibility Statement

**AccessLens is itself WCAG 2.2 AA compliant.**

Implemented accessibility features:

- ✓ Skip-to-main-content link (first Tab stop)
- ✓ Logical Tab order: TopNav → InputPanel → Cards → EmulationWidget
- ✓ All interactive elements keyboard operable (Enter/Space/Escape)
- ✓ Focus trap in Before/After panel and EmulationWidget
- ✓ Focus return to trigger element on dialog close
- ✓ `aria-label`, `aria-live`, `aria-pressed` throughout
- ✓ `prefers-reduced-motion` support (all animations disabled)
- ✓ Color never sole differentiator (icon + text + color badges)
- ✓ Screen reader announcements for state changes

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | TailwindCSS 3 |
| Animation | Framer Motion |
| Accessibility | axe-core 4.9, @axe-core/react |
| Testing | Vitest + React Testing Library |
| Icons | Lucide React |
| Data Viz | D3 (scale, interpolate) |

---

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint (zero warnings)
npm run format       # Prettier formatting
npm test             # Vitest test suite
npm run typecheck    # TypeScript check (tsc --noEmit)
```

---

## Demo Walkthrough

**Live Demo:** https://accesslens-dtockenpl-zuma3247s-projects.vercel.app

Watch the 3-minute feature demonstration: **[Loom Walkthrough](loom-link-to-be-added)**

Walkthrough covers:
1. Dashboard seed scan animation
2. Heatmap filtering (Perceivable × Critical)
3. Issue card expansion + "Copy Fix Prompt"
4. Batch copy for critical fixes
5. Before/After drag handle demo
6. Deuteranopia filter (color-blindness empathy)
7. Macular Degeneration simulation
8. Dark mode toggle
9. Keyboard navigation demo

---

## Project Structure

```
accesslens/
├── src/
│   ├── components/
│   │   ├── before-after/      # Before/After panel + demos
│   │   ├── emulation/         # Vision filter widget + SVG defs
│   │   ├── heatmap/           # Issue severity heatmap
│   │   ├── input/             # URL/HTML input panel
│   │   ├── issues/            # Issue cards + detail view
│   │   ├── layout/            # TopNav, ResultsDashboard
│   │   ├── prompt/            # Copy buttons + batch modal
│   │   ├── score/             # Score ring + level breakdown
│   │   └── skeleton/          # Loading states
│   ├── context/               # Theme + Emulation providers
│   ├── data/                  # Impairment filter definitions
│   ├── hooks/                 # useAudit, useCopyPrompt, etc.
│   ├── lib/                   # Utilities + prompt generator
│   ├── styles/                # Global CSS + design tokens
│   └── types/                 # TypeScript interfaces
└── README.md
```

---

## Contributing

This is a design challenge prototype. For production use, consider:

- Server-side URL crawling (Vercel Edge Function)
- User auth + saved reports (Supabase)
- PDF/CSV export (jsPDF)
- CI/CD GitHub Action integration
- Figma Plugin API implementation

---

## License

Built for the WWT UX Apprenticeship — Accessibility as a value, not a checkbox.
