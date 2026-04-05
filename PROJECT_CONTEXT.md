# AccessLens Project Context

This file captures the implicit context and knowledge that has been developed during the development process. This context exists in the development environment's memory and conversations but may not be explicitly documented in other project files.

## Project Overview

AccessLens is a web accessibility auditing tool that allows users to:
- Scan URLs or HTML snippets for accessibility violations
- View detailed issue reports with WCAG compliance information
- See live previews of pages with violation overlays
- Generate AI prompts for fixing accessibility issues
- Visualize issues through heatmaps and severity breakdowns

## Architecture

### Core Technologies
- **Frontend**: React + TypeScript + Vite
- **Deployment**: Vercel with serverless functions
- **Accessibility Engine**: axe-core
- **Styling**: CSS with CSS variables for theming
- **Testing**: Vitest
- **State Management**: React hooks and context

### Key Directories
- `src/components/` - React components organized by feature
- `src/lib/` - Core business logic (audit engine, URL fetching, etc.)
- `src/types/` - TypeScript type definitions
- `src/data/` - Seed data and filters
- `api/` - Vercel serverless functions
- `src/test/` - Test files

## Important Implementation Details

### URL Live Preview Feature
The most recently implemented feature allows live preview of external URLs with accessibility violation overlays:

1. **Proxy Architecture**: Uses a Vercel serverless proxy at `/api/proxy` to bypass CORS restrictions
2. **Data Flow**: 
   - URL → `/api/proxy` → Fetch HTML with base tag injection → Store in `AuditPayload.fetchedHtml` → Display in LivePreviewPanel
3. **Security**: Proxy blocks private IPs and includes timeout/error handling
4. **Development**: Vite middleware provides same proxy behavior locally

### Audit Process
1. **URL Mode**: Fetch HTML via proxy → Run axe-core analysis → Map results to internal types
2. **HTML Mode**: Direct axe-core analysis on provided HTML
3. **Fallback**: If URL fetch fails, use seeded demo data

### State Management Patterns
- `useAudit.ts` manages audit state and view state
- `EmulationContext` handles vision impairment filters
- Component-local state for UI interactions (collapsible panels, etc.)

### Key Components
- `ResultsDashboard` - Main results view with conditional LivePreviewPanel
- `LivePreviewPanel` - Renders iframe with CSS-only violation highlights
- `IssueCardList` - Filterable list of accessibility issues
- `ScoreRing` - Animated circular progress indicator
- `IssueHeatmap` - Table visualization of issues by principle/severity

## Recent Changes and Decisions

### Live Preview Implementation (April 2025)
- Added `fetchedHtml` field to `AuditPayload` type
- Created `/api/proxy` serverless function with security hardening
- Updated `vercel.json` to exclude `/api/*` from SPA rewrites
- Modified `urlFetcher.ts` to use proxy and inject base tags
- Ungated `LivePreviewPanel` for URL mode when `fetchedHtml` exists
- Adjusted iframe sandbox attributes for external content

### Build Fixes
- Fixed TypeScript compilation errors by adding missing `scanMode` field in test payloads and mapper
- Resolved Vercel deployment issues by converting API handler to Node-style signature
- Addressed URL parsing deprecation warnings by using WHATWG URL API

## Development Patterns

### Component Organization
- Components are grouped by feature (live-preview, score, heatmap, etc.)
- Each component focuses on a single responsibility
- Consistent prop patterns and TypeScript usage

### Error Handling
- Graceful fallbacks for URL fetch failures
- User-friendly error messages in the proxy
- Loading states and skeleton components

### Accessibility Considerations
- ARIA labels and roles throughout
- Keyboard navigation support
- Screen reader friendly markup
- High contrast mode support

## Testing Strategy
- Unit tests for business logic (score calculation, heatmap transformation)
- Component tests for UI interactions
- Integration tests for audit flows
- Manual testing with real-world accessibility scenarios

## Known Limitations
- JavaScript-heavy SPAs may not render fully in live preview (no JS execution)
- Some sites with bot protection may block the proxy
- External assets (fonts, complex CSS) may not load perfectly in preview

## Future Considerations
- Potential Puppeteer integration for full SPA rendering
- Expanded WCAG coverage beyond current axe-core rules
- Performance optimizations for large audits
- Additional vision impairment emulations

## Environment Variables and Configuration
- No required environment variables for basic functionality
- Vercel automatically handles deployment configuration
- Local development uses Vite dev server with proxy middleware

## Debugging Tips
- Check browser console for proxy errors
- Verify Vercel function logs for API issues
- Use seeded demo data when external URLs fail
- Network tab can show proxy request/response details

## Code Quality Standards
- Strict TypeScript configuration
- ESLint for code consistency
- Semantic HTML and CSS
- Comprehensive error boundaries
- Consistent naming conventions

This context represents the accumulated knowledge from the development process and should help new developers or AI assistants understand the project's current state and recent implementation decisions.
