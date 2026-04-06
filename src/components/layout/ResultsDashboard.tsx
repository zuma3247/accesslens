import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { AuditPayload, HeatmapGrid, Issue, HeatmapFilter } from '@/types/audit.types';
import { useBatchCopy } from '@/hooks/useBatchCopy';
import { useResizableColumns } from '@/hooks/useResizableColumns';
import { ScoreRing } from '@/components/score/ScoreRing';
import { LevelBreakdown } from '@/components/score/LevelBreakdown';
import { IssueHeatmap } from '@/components/heatmap/IssueHeatmap';
import { IssueCardList } from '@/components/issues/IssueCardList';
import { IssueDetail } from '@/components/issues/IssueDetail';
import { CopyAllCriticalButton } from '@/components/prompt/CopyAllCriticalButton';
import { BatchPromptModal } from '@/components/prompt/BatchPromptModal';
import { BeforeAfterPanel } from '@/components/before-after/BeforeAfterPanel';
import { DemoDataBanner } from './DemoDataBanner';
import { DragHandle } from './DragHandle';
import { LivePreviewPanel } from '@/components/live-preview/LivePreviewPanel';
import { TriagedScore } from '../score/TriagedScore';
import {
  getDismissedViolations,
  generateDismissalKey,
  dismissViolation,
  restoreViolation,
} from '@/lib/axiomConfidence';
import type { DismissalReason } from '@/lib/axiomConfidence';

interface ResultsDashboardProps {
  payload: AuditPayload;
  heatmapGrid: HeatmapGrid;
}

export function ResultsDashboard({ payload, heatmapGrid }: ResultsDashboardProps) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [heatmapFilter, setHeatmapFilter] = useState<HeatmapFilter | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [beforeAfterIssue, setBeforeAfterIssue] = useState<Issue | null>(null);
  const [isBeforeAfterOpen, setIsBeforeAfterOpen] = useState(false);
  const [beforeAfterTriggerElement, setBeforeAfterTriggerElement] = useState<HTMLElement | null>(null);
  const [isLivePreviewCollapsed, setIsLivePreviewCollapsed] = useState(false);
  const [showHighlights, setShowHighlights] = useState(true);
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());

  const scanMode = payload.scanMode || 'unknown';
  const hasLivePreview = payload.scanMode === 'html' || !!payload.fetchedHtml;
  const splitLayout = hasLivePreview && !isLivePreviewCollapsed && showHighlights;

  const closeTimeoutRef = useRef<number | null>(null);
  const { promptText } = useBatchCopy(payload);
  const { leftWidth, rightWidth, startLeftDrag, startRightDrag } = useResizableColumns();

  useEffect(() => {
    setDismissedKeys(getDismissedViolations());
  }, []);

  const dismissedIssueIds = useMemo(() => {
    const keys = new Set<string>();
    for (const issue of payload.issues) {
      const key = generateDismissalKey(scanMode, issue.ruleId, issue.id);
      if (dismissedKeys.has(key)) keys.add(key);
    }
    return keys;
  }, [payload.issues, scanMode, dismissedKeys]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) window.clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleDismiss = useCallback((issue: Issue, reason: DismissalReason) => {
    const key = generateDismissalKey(scanMode, issue.ruleId, issue.id);
    dismissViolation(key);
    setDismissedKeys((prev) => new Set([...prev, key]));
    // Deselect if the dismissed issue is currently selected
    setSelectedIssue((prev) => (prev?.id === issue.id ? null : prev));
  }, [scanMode]);

  const handleRestore = useCallback((issue: Issue) => {
    const key = generateDismissalKey(scanMode, issue.ruleId, issue.id);
    restoreViolation(key);
    setDismissedKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, [scanMode]);

  const handleOpenBeforeAfter = (issue: Issue, triggerElement?: HTMLElement) => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setBeforeAfterIssue(issue);
    setIsBeforeAfterOpen(true);
    if (triggerElement) setBeforeAfterTriggerElement(triggerElement);
    setSelectedIssue(issue);
  };

  const handleCloseBeforeAfter = () => {
    setIsBeforeAfterOpen(false);
    closeTimeoutRef.current = window.setTimeout(() => {
      setBeforeAfterIssue(null);
      closeTimeoutRef.current = null;
    }, 250);
    if (beforeAfterTriggerElement) {
      beforeAfterTriggerElement.focus();
      setBeforeAfterTriggerElement(null);
    }
  };

  const heatmapBlock = (
    <div className="p-6 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl">
      <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[hsl(var(--color-text-secondary))] mb-4">
        Issue Heatmap
      </h3>
      <IssueHeatmap
        grid={heatmapGrid}
        onCellClick={setHeatmapFilter}
        activeFilter={heatmapFilter}
      />
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto">
      <DemoDataBanner payload={payload} />

      {/* Resizable three-column layout */}
      <div className="flex flex-col lg:flex-row">

        {/* ── Left column: Score + Level Breakdown ── */}
        <div
          className="space-y-6 lg:flex-shrink-0 lg:pr-2 lg:self-start"
          style={{ width: leftWidth } as React.CSSProperties}
        >
          <div className="p-6 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl">
            <ScoreRing
              score={payload.overallScore}
              grade={payload.grade}
              isFallback={payload.isFallback}
              levelBreakdown={payload.levelBreakdown}
            />
            <TriagedScore
              issues={payload.issues}
              dismissedIssueIds={dismissedIssueIds}
              scanMode={scanMode}
            />
          </div>

          <div className="p-6 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl">
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[hsl(var(--color-text-secondary))] mb-4">
              Level Breakdown
            </h3>
            <LevelBreakdown breakdown={payload.levelBreakdown} />
          </div>
        </div>

        {/* Left drag handle */}
        <DragHandle onMouseDown={startLeftDrag} label="Resize left column" />

        {/* ── Center column: Preview + Heatmap (conditional) + Issue List ── */}
        <div className="flex-1 min-w-0 space-y-6 lg:px-2">
          {hasLivePreview && (
            <LivePreviewPanel
              htmlContent={payload.fetchedHtml || payload.auditedInput}
              issues={payload.issues}
              isCollapsed={isLivePreviewCollapsed}
              onToggleCollapsed={() => setIsLivePreviewCollapsed((prev) => !prev)}
              isUrlContent={!!payload.fetchedHtml}
              showHighlights={showHighlights}
              onShowHighlightsChange={setShowHighlights}
            />
          )}

          {/* Heatmap in center when not in split layout */}
          {!splitLayout && heatmapBlock}

          {/* Copy All Button */}
          <div className="md:flex md:justify-end">
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-[hsl(var(--color-bg-surface))] border-t border-[hsl(var(--color-border))] md:static md:p-0 md:bg-transparent md:border-0 z-50 md:z-auto">
              <div className="flex justify-end max-w-7xl mx-auto md:max-w-none">
                <CopyAllCriticalButton
                  payload={payload}
                  onModalOpen={() => setIsBatchModalOpen(true)}
                />
              </div>
            </div>
            <div className="h-28 md:hidden" />
          </div>

          <IssueCardList
            issues={payload.issues}
            heatmapFilter={heatmapFilter}
            onClearHeatmapFilter={() => setHeatmapFilter(null)}
            selectedIssue={selectedIssue}
            onSelectIssue={setSelectedIssue}
            onOpenBeforeAfter={handleOpenBeforeAfter}
            scanMode={scanMode}
            dismissedKeys={dismissedKeys}
            onDismissedKeysChange={setDismissedKeys}
            onDismiss={handleDismiss}
            onRestore={handleRestore}
          />
        </div>

        {/* Right drag handle */}
        <DragHandle onMouseDown={startRightDrag} label="Resize right column" />

        {/* ── Right column: Heatmap (split) + Issue Detail ── */}
        <div
          className="space-y-6 lg:flex-shrink-0 lg:pl-2"
          style={{ width: rightWidth } as React.CSSProperties}
        >
          {/* Heatmap moves here when preview is visible with highlights on */}
          {splitLayout && heatmapBlock}

          <div className="sticky top-4 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl overflow-hidden">
            <div className="px-4 pt-4 pb-2 border-b border-[hsl(var(--color-border))]">
              <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[hsl(var(--color-text-secondary))]">
                Selected Issue
              </h3>
              <p className="text-xs text-[hsl(var(--color-text-secondary))] mt-0.5">
                Stays visible as you scroll the list
              </p>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
              <IssueDetail
                issue={selectedIssue}
                onOpenBeforeAfter={handleOpenBeforeAfter}
                scanMode={scanMode}
                dismissedKeys={dismissedKeys}
                onDismiss={handleDismiss}
                onRestore={handleRestore}
              />
            </div>
          </div>
        </div>
      </div>

      <BatchPromptModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        promptText={promptText}
      />

      {beforeAfterIssue && (
        <BeforeAfterPanel
          issue={beforeAfterIssue}
          isOpen={isBeforeAfterOpen}
          onClose={handleCloseBeforeAfter}
        />
      )}
    </div>
  );
}
