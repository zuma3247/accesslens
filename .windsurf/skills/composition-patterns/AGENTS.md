# AccessLens React Composition Patterns

**Version 1.0.0**  
AccessLens WCAG Accessibility Dashboard  
April 2026

> **Note:**  
> This document is for AI agents and LLMs working on the AccessLens codebase. Contains
> project-specific composition patterns for the accessibility dashboard components.

---

## Abstract

Composition patterns for building flexible, maintainable React components in the AccessLens accessibility dashboard. Focuses on compound components for Issue Cards, Emulation Widget, and Results Panel. Includes state management patterns for the audit results data flow.

---

## Table of Contents

1. [Component Architecture](#1-component-architecture) — **HIGH**
   - 1.1 [Avoid Boolean Props in Issue Cards](#11-avoid-boolean-props-in-issue-cards)
   - 1.2 [Use Compound Components for EmulationWidget](#12-use-compound-components-for-emulationwidget)
2. [State Management](#2-state-management) — **MEDIUM**
   - 2.1 [Lift State into Provider Components](#21-lift-state-into-provider-components)
   - 2.2 [Decouple State Management from UI](#22-decouple-state-management-from-ui)
3. [Implementation Patterns](#3-implementation-patterns) — **MEDIUM**
   - 3.1 [Create Explicit Component Variants](#31-create-explicit-component-variants)
   - 3.2 [Prefer Composing Children Over Render Props](#32-prefer-composing-children-over-render-props)

---

## 1. Component Architecture

**Impact: HIGH**

Fundamental patterns for structuring AccessLens components to avoid prop proliferation.

### 1.1 Avoid Boolean Props in Issue Cards

**Impact: CRITICAL (prevents unmaintainable card variants)**

Don't add boolean props like `isExpanded`, `hasBeforeAfter`, `isCritical`, `showActions` to customize IssueCard behavior. Each boolean doubles possible states. Use composition instead.

**Incorrect: boolean props create exponential complexity**

```tsx
function IssueCard({
  issue,
  isExpanded,
  hasBeforeAfter,
  showActions,
  showCodeSnippet,
  isCompact,
}: IssueCardProps) {
  return (
    <div className={cn('issue-card', isExpanded && 'expanded', isCompact && 'compact')}>
      <SeverityBadge severity={issue.severity} />
      <h3>{issue.wcagCriterion}</h3>
      
      {isExpanded && (
        <>
          {showCodeSnippet && <CodeSnippet code={issue.codeSnippet} />}
          {hasBeforeAfter && <BeforeAfterLink type={issue.beforeAfterType} />}
          {showActions && (
            <div className="actions">
              <CopyPromptButton issue={issue} />
              <ViewWCAGLink criterion={issue.wcagCriterion} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

**Correct: composition eliminates conditionals**

```tsx
const IssueCardContext = createContext<IssueCardContextValue | null>(null);

function IssueCardProvider({ issue, children }: { issue: Issue; children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const actions = useMemo(() => ({
    expand: () => setIsExpanded(true),
    collapse: () => setIsExpanded(false),
    toggle: () => setIsExpanded(prev => !prev),
  }), []);
  
  return (
    <IssueCardContext value={{ issue, isExpanded, actions }}>
      {children}
    </IssueCardContext>
  );
}

function IssueCardRoot({ children, ...props }: ComponentProps<'div'>) {
  return <div className="issue-card" {...props}>{children}</div>;
}

function IssueCardHeader() {
  const { issue, actions } = use(IssueCardContext);
  
  return (
    <header className="issue-card-header" onClick={actions.toggle}>
      <SeverityBadge severity={issue.severity} />
      <span className="criterion">{issue.wcagCriterion}</span>
      <span className="count">({issue.affectedCount} elements)</span>
      <ChevronDown />
    </header>
  );
}

function IssueCardBody() {
  const { issue, isExpanded } = use(IssueCardContext);
  
  if (!isExpanded) return null;
  
  return (
    <div className="issue-card-body">
      <p className="description">{issue.description}</p>
      <CodeSnippet code={issue.codeSnippet} />
      <p className="fix-suggestion">{issue.fixSuggestion}</p>
    </div>
  );
}

function IssueCardFooter() {
  const { issue, isExpanded } = use(IssueCardContext);
  
  if (!isExpanded) return null;
  
  return (
    <footer className="issue-card-footer">
      <CopyPromptButton issue={issue} />
      <ViewWCAGLink criterion={issue.wcagCriterion} />
      {issue.hasBeforeAfter && (
        <BeforeAfterLink type={issue.beforeAfterType} />
      )}
    </footer>
  );
}

// Export compound component
const IssueCard = {
  Provider: IssueCardProvider,
  Root: IssueCardRoot,
  Header: IssueCardHeader,
  Body: IssueCardBody,
  Footer: IssueCardFooter,
};
```

**Usage:**

```tsx
// Default usage
<IssueCard.Provider issue={issue}>
  <IssueCard.Root>
    <IssueCard.Header />
    <IssueCard.Body />
    <IssueCard.Footer />
  </IssueCard.Root>
</IssueCard.Provider>

// Custom usage - different arrangement
<IssueCard.Provider issue={issue}>
  <IssueCard.Root>
    <IssueCard.Header />
    <div className="custom-layout">
      <IssueCard.Body />
      <CustomComponent />
    </div>
  </IssueCard.Root>
</IssueCard.Provider>
```

---

### 1.2 Use Compound Components for EmulationWidget

**Impact: HIGH (enables flexible composition without prop drilling)**

Structure the EmulationWidget as compound components with a shared context. Each subcomponent accesses shared state via context, not props.

**Incorrect: monolithic component with many props**

```tsx
function EmulationWidget({
  activeFilter,
  onFilterChange,
  onClose,
  showIndicator,
  position,
  className,
}: EmulationWidgetProps) {
  return (
    <div className={cn('emulation-widget', position, className)}>
      <button onClick={onClose}>Close</button>
      <div className="filter-grid">
        {FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={cn(activeFilter === filter.id && 'active')}
          >
            {filter.name}
          </button>
        ))}
      </div>
      {showIndicator && activeFilter && <ActiveIndicator filter={activeFilter} />}
    </div>
  );
}
```

**Correct: compound components with shared context**

```tsx
interface EmulationState {
  activeFilter: ImpairmentKey | null;
  isOpen: boolean;
}

interface EmulationActions {
  activate: (filter: ImpairmentKey) => void;
  deactivate: () => void;
  toggle: () => void;
  close: () => void;
}

const EmulationContext = createContext<{
  state: EmulationState;
  actions: EmulationActions;
} | null>(null);

function EmulationProvider({ children }: { children: React.ReactNode }) {
  const [activeFilter, setActiveFilter] = useState<ImpairmentKey | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  
  const actions = useMemo(() => ({
    activate: (filter: ImpairmentKey) => {
      setActiveFilter(filter);
      applyFilterToApp(filter);
    },
    deactivate: () => {
      setActiveFilter(null);
      removeFilterFromApp();
    },
    toggle: () => setIsOpen(prev => !prev),
    close: () => setIsOpen(false),
  }), []);
  
  return (
    <EmulationContext value={{ state: { activeFilter, isOpen }, actions }}>
      {children}
    </EmulationContext>
  );
}

function EmulationWidget() {
  const { state } = use(EmulationContext);
  
  return (
    <div className="emulation-widget">
      <EmulationToggle />
      
      {state.isOpen && (
        <EmulationPanel>
          <EmulationFilterGrid />
          <EmulationDescription />
        </EmulationPanel>
      )}
      
      {state.activeFilter && <EmulationActiveIndicator />}
    </div>
  );
}

function EmulationToggle() {
  const { state, actions } = use(EmulationContext);
  
  return (
    <button 
      onClick={actions.toggle}
      className={cn('emulation-toggle', state.isOpen && 'active')}
      aria-expanded={state.isOpen}
    >
      <Eye />
      <span>Vision Emulation</span>
      {state.activeFilter && <span className="indicator-dot" />}
    </button>
  );
}

function EmulationPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="emulation-panel"
    >
      {children}
    </motion.div>
  );
}

function EmulationFilterGrid() {
  const { state, actions } = use(EmulationContext);
  
  return (
    <div className="filter-grid" role="group" aria-label="Vision impairment filters">
      <button
        onClick={actions.deactivate}
        aria-pressed={state.activeFilter === null}
        className={cn('filter-button', state.activeFilter === null && 'active')}
      >
        None
      </button>
      {IMPAIRMENT_FILTERS.map(filter => (
        <button
          key={filter.id}
          onClick={() => actions.activate(filter.id)}
          aria-pressed={state.activeFilter === filter.id}
          className={cn(
            'filter-button',
            state.activeFilter === filter.id && 'active'
          )}
        >
          {filter.name}
        </button>
      ))}
    </div>
  );
}

function EmulationDescription() {
  const { state } = use(EmulationContext);
  const filter = IMPAIRMENT_FILTERS.find(f => f.id === state.activeFilter);
  
  if (!filter) return null;
  
  return (
    <p className="filter-description">
      <strong>{filter.name}:</strong> {filter.description}
      <span className="prevalence">Prevalence: {filter.prevalence}</span>
    </p>
  );
}

function EmulationActiveIndicator() {
  return (
    <div className="active-indicator" aria-live="polite">
      <span className="visually-hidden">
        Vision emulation is active
      </span>
    </div>
  );
}

// Export as compound component
const Emulation = {
  Provider: EmulationProvider,
  Widget: EmulationWidget,
  Toggle: EmulationToggle,
  Panel: EmulationPanel,
  FilterGrid: EmulationFilterGrid,
  Description: EmulationDescription,
  ActiveIndicator: EmulationActiveIndicator,
};
```

**Usage:**

```tsx
<Emulation.Provider>
  <Emulation.Widget />
</Emulation.Provider>
```

Consumers compose exactly what they need. The widget controls never get filtered because they're outside `#app-root` where filters are applied.

---

## 2. State Management

**Impact: MEDIUM**

Patterns for lifting state and managing shared context across AccessLens components.

### 2.1 Lift State into Provider Components

**Impact: HIGH (enables state sharing across the dashboard)**

Move state management into dedicated provider components. This allows sibling components to access and modify state without prop drilling.

**Incorrect: state trapped inside component**

```tsx
function ResultsDashboard({ auditResult }: { auditResult: AuditPayload }) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortKey>('severity');
  
  return (
    <div className="dashboard">
      <FilterBar 
        filters={filters} 
        onChange={setFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      <Heatmap 
        issues={auditResult.issues}
        onCellClick={(principle, severity) => {
          setFilters(prev => ({ ...prev, principle, severity }));
        }}
      />
      <IssueCardList
        issues={auditResult.issues}
        filters={filters}
        sortBy={sortBy}
        selectedIssue={selectedIssue}
        onSelect={setSelectedIssue}
      />
      <RightPanel issue={selectedIssue} />
    </div>
  );
}
```

**Correct: state lifted to provider**

```tsx
interface ResultsState {
  selectedIssue: Issue | null;
  filters: Filters;
  sortBy: SortKey;
}

interface ResultsActions {
  selectIssue: (issue: Issue | null) => void;
  setFilters: (filters: Filters) => void;
  setSortBy: (sortBy: SortKey) => void;
  filterByCell: (principle: string, severity: string) => void;
}

const ResultsContext = createContext<{
  state: ResultsState;
  actions: ResultsActions;
} | null>(null);

function ResultsProvider({ 
  children, 
  auditResult 
}: { 
  children: React.ReactNode; 
  auditResult: AuditPayload;
}) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortKey>('severity');
  
  const actions = useMemo(() => ({
    selectIssue: setSelectedIssue,
    setFilters,
    setSortBy,
    filterByCell: (principle: string, severity: string) => {
      setFilters(prev => ({ ...prev, principle, severity }));
    },
  }), []);
  
  const value = useMemo(() => ({
    state: { selectedIssue, filters, sortBy },
    actions,
  }), [selectedIssue, filters, sortBy, actions]);
  
  return (
    <ResultsContext value={value}>
      {children}
    </ResultsContext>
  );
}

// Subcomponents consume context
function FilterBar() {
  const { state, actions } = use(ResultsContext);
  
  return (
    <div className="filter-bar">
      <SeverityFilter 
        value={state.filters.severity}
        onChange={severity => actions.setFilters(prev => ({ ...prev, severity }))}
      />
      <SortControl 
        value={state.sortBy}
        onChange={actions.setSortBy}
      />
    </div>
  );
}

function Heatmap({ issues }: { issues: Issue[] }) {
  const { actions } = use(ResultsContext);
  
  return (
    <table>
      {/* Cells call actions.filterByCell on click */}
    </table>
  );
}

function IssueCardList({ issues }: { issues: Issue[] }) {
  const { state, actions } = use(ResultsContext);
  
  const filteredIssues = applyFilters(issues, state.filters);
  const sortedIssues = sortIssues(filteredIssues, state.sortBy);
  
  return (
    <div className="issue-list">
      {sortedIssues.map(issue => (
        <IssueCard
          key={issue.id}
          issue={issue}
          isSelected={state.selectedIssue?.id === issue.id}
          onClick={() => actions.selectIssue(issue)}
        />
      ))}
    </div>
  );
}

function RightPanel() {
  const { state } = use(ResultsContext);
  
  if (!state.selectedIssue) {
    return <EmptyState />;
  }
  
  return (
    <div className="right-panel">
      <IssueDetail issue={state.selectedIssue} />
    </div>
  );
}

// Usage
function ResultsDashboard({ auditResult }: { auditResult: AuditPayload }) {
  return (
    <ResultsProvider auditResult={auditResult}>
      <div className="dashboard">
        <FilterBar />
        <Heatmap issues={auditResult.issues} />
        <IssueCardList issues={auditResult.issues} />
        <RightPanel />
      </div>
    </ResultsProvider>
  );
}
```

---

### 2.2 Decouple State Management from UI

**Impact: MEDIUM (enables swapping state implementations)**

The provider component should be the only place that knows how state is managed. UI components consume the context interface—they don't know if state comes from useState, Zustand, or a server sync.

**Incorrect: UI coupled to state implementation**

```tsx
function FilterBar() {
  // UI component knows about URL search params
  const [searchParams, setSearchParams] = useSearchParams();
  const severity = searchParams.get('severity');
  
  return (
    <select 
      value={severity ?? 'all'}
      onChange={e => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('severity', e.target.value);
        setSearchParams(newParams);
      }}
    >
      <option value="all">All Severities</option>
      <option value="critical">Critical</option>
      <option value="serious">Serious</option>
      <option value="moderate">Moderate</option>
      <option value="minor">Minor</option>
    </select>
  );
}
```

**Correct: state management isolated in provider**

```tsx
// Provider handles URL persistence
function FilterProvider({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const state = useMemo(() => ({
    severity: searchParams.get('severity') ?? 'all',
    principle: searchParams.get('principle') ?? 'all',
  }), [searchParams]);
  
  const actions = useMemo(() => ({
    setSeverity: (severity: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (severity === 'all') {
        newParams.delete('severity');
      } else {
        newParams.set('severity', severity);
      }
      setSearchParams(newParams);
    },
    setPrinciple: (principle: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (principle === 'all') {
        newParams.delete('principle');
      } else {
        newParams.set('principle', principle);
      }
      setSearchParams(newParams);
    },
  }), [searchParams, setSearchParams]);
  
  return (
    <FilterContext value={{ state, actions }}>
      {children}
    </FilterContext>
  );
}

// UI component only knows about the context interface
function FilterBar() {
  const { state, actions } = use(FilterContext);
  
  return (
    <div className="filter-bar">
      <select
        value={state.severity}
        onChange={e => actions.setSeverity(e.target.value)}
        aria-label="Filter by severity"
      >
        <option value="all">All Severities</option>
        <option value="critical">Critical</option>
        <option value="serious">Serious</option>
        <option value="moderate">Moderate</option>
        <option value="minor">Minor</option>
      </select>
    </div>
  );
}
```

**Benefits:**
- UI components are portable—same FilterBar works with local state, URL state, or global state
- Easy to test—mock the context instead of mocking URL APIs
- Can switch implementations without touching UI components

---

## 3. Implementation Patterns

**Impact: MEDIUM**

Specific techniques for implementing compound components in AccessLens.

### 3.1 Create Explicit Component Variants

**Impact: MEDIUM (self-documenting code, no hidden conditionals)**

Instead of one component with many boolean props, create explicit variant components. Each variant composes the pieces it needs.

**Incorrect: one component, many modes**

```tsx
// What does this component actually render?
<CopyPromptButton
  issue={issue}
  size="small"
  showIcon={true}
  variant="primary"
  isCopied={copied}
/>
```

**Correct: explicit variants**

```tsx
// Primary button for issue cards
function CopyPromptButton({ issue }: { issue: Issue }) {
  const { copy, copied } = useCopyPrompt(issue);
  
  return (
    <Button onClick={copy} variant="primary">
      {copied ? <Check /> : <ClipboardCopy />}
      {copied ? 'Copied!' : 'Copy Fix Prompt'}
    </Button>
  );
}

// Compact icon-only button for mobile
function CopyPromptIconButton({ issue }: { issue: Issue }) {
  const { copy, copied } = useCopyPrompt(issue);
  
  return (
    <IconButton 
      onClick={copy}
      aria-label={`Copy fix prompt for ${issue.wcagCriterion}`}
    >
      {copied ? <Check /> : <ClipboardCopy />}
    </IconButton>
  );
}

// Batch copy button for the dashboard header
function CopyAllCriticalButton({ issues }: { issues: Issue[] }) {
  const criticals = issues.filter(i => i.severity === 'critical');
  const { copy, copied } = useBatchCopy(criticals);
  
  if (criticals.length === 0) {
    return <Badge variant="success">No critical violations</Badge>;
  }
  
  return (
    <Button onClick={copy} variant="secondary">
      {copied ? <Check /> : <ClipboardCopy />}
      {copied ? 'Copied!' : `Copy All Critical Fixes (${criticals.length})`}
    </Button>
  );
}
```

Each implementation is explicit about:
- What icons it shows
- What text it displays
- What variant/style it uses
- What conditions change its appearance

No boolean prop combinations to reason about. No impossible states.

---

### 3.2 Prefer Composing Children Over Render Props

**Impact: MEDIUM (cleaner composition, better readability)**

Use `children` for composition instead of `renderX` props. Children are more readable, compose naturally, and don't require understanding callback signatures.

**Incorrect: render props**

```tsx
function ResultsPanel({
  renderHeader,
  renderContent,
  renderFooter,
}: {
  renderHeader?: () => React.ReactNode;
  renderContent: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
}) {
  return (
    <div className="results-panel">
      {renderHeader?.()}
      <div className="content">{renderContent()}</div>
      {renderFooter?.()}
    </div>
  );
}

// Usage is awkward
<ResultsPanel
  renderHeader={() => <ScoreRing score={44} />}
  renderContent={() => (
    <>
      <Heatmap issues={issues} />
      <IssueCardList issues={issues} />
    </>
  )}
  renderFooter={() => <CopyAllCriticalButton issues={issues} />}
/>
```

**Correct: compound components with children**

```tsx
function ResultsPanel({ children }: { children: React.ReactNode }) {
  return <div className="results-panel">{children}</div>;
}

function ResultsHeader({ children }: { children: React.ReactNode }) {
  return <header className="results-header">{children}</header>;
}

function ResultsContent({ children }: { children: React.ReactNode }) {
  return <div className="results-content">{children}</div>;
}

function ResultsFooter({ children }: { children: React.ReactNode }) {
  return <footer className="results-footer">{children}</footer>;
}

// Export compound component
const Results = {
  Panel: ResultsPanel,
  Header: ResultsHeader,
  Content: ResultsContent,
  Footer: ResultsFooter,
};

// Usage is flexible and clear
<Results.Panel>
  <Results.Header>
    <ScoreRing score={44} />
    <GradeBadge grade="AA" />
  </Results.Header>
  
  <Results.Content>
    <Heatmap issues={issues} />
    <IssueCardList issues={issues} />
  </Results.Content>
  
  <Results.Footer>
    <CopyAllCriticalButton issues={issues} />
  </Results.Footer>
</Results.Panel>
```

**When render props are appropriate:**

```tsx
// Render props work well when you need to pass data back
<List
  data={items}
  renderItem={({ item, index }) => <Item item={item} index={index} />}
/>
```

Use render props when the parent needs to provide data or state to the child. Use children when composing static structure.

---

## Core Principles for AccessLens

1. **Composition over configuration** — Instead of adding props, let consumers compose subcomponents
2. **Lift your state** — State in providers, not trapped in components
3. **Compose your internals** — Subcomponents access context, not props
4. **Explicit variants** — Create `CollapsedIssueCard`, `ExpandedIssueCard`, not `IssueCard` with `isExpanded`

---

## Component Checklist

When creating new components for AccessLens:

- [ ] Does the component have more than 3 boolean props? Consider compound components.
- [ ] Is state needed by sibling components? Lift to a provider.
- [ ] Are there multiple visual variants? Create explicit variant components.
- [ ] Does the component use render props? Consider children composition instead.
- [ ] Is the component tightly coupled to a specific state implementation? Decouple via context interface.

---

## File References

- IssueCard: `src/components/results/IssueCard.tsx`
- EmulationWidget: `src/components/emulation/EmulationWidget.tsx`
- ResultsDashboard: `src/components/results/ResultsDashboard.tsx`
- ThemeContext: `src/context/ThemeContext.tsx`

---

## References

1. [https://react.dev](https://react.dev)
2. [https://react.dev/learn/passing-data-deeply-with-context](https://react.dev/learn/passing-data-deeply-with-context)
3. [https://react.dev/reference/react/use](https://react.dev/reference/react/use)
