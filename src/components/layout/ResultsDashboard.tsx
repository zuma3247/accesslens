import { useState, useRef } from 'react';
import type { AuditPayload, HeatmapGrid, Issue, HeatmapFilter } from '@/types/audit.types';
import { useBatchCopy } from '@/hooks/useBatchCopy';
import { ScoreRing } from '@/components/score/ScoreRing';
import { LevelBreakdown } from '@/components/score/LevelBreakdown';
import { IssueHeatmap } from '@/components/heatmap/IssueHeatmap';
import { IssueCardList } from '@/components/issues/IssueCardList';
import { IssueDetail } from '@/components/issues/IssueDetail';
import { CopyAllCriticalButton } from '@/components/prompt/CopyAllCriticalButton';
import { BatchPromptModal } from '@/components/prompt/BatchPromptModal';
import { BeforeAfterPanel } from '@/components/before-after/BeforeAfterPanel';

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
  const closeTimeoutRef = useRef<number | null>(null);
  const { promptText } = useBatchCopy(payload);

  const handleOpenBeforeAfter = (issue: Issue, triggerElement?: HTMLElement) => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setBeforeAfterIssue(issue);
    setIsBeforeAfterOpen(true);
    if (triggerElement) {
      setBeforeAfterTriggerElement(triggerElement);
    }
    // Also select the issue to keep right panel in sync
    setSelectedIssue(issue);
  };

  const handleCloseBeforeAfter = () => {
    setIsBeforeAfterOpen(false);
    // Delay clearing beforeAfterIssue to allow exit animation (250ms)
    closeTimeoutRef.current = window.setTimeout(() => {
      setBeforeAfterIssue(null);
      closeTimeoutRef.current = null;
    }, 250);
    // Return focus to the trigger element immediately
    if (beforeAfterTriggerElement) {
      beforeAfterTriggerElement.focus();
      setBeforeAfterTriggerElement(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel - Score Overview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl">
            <ScoreRing score={payload.overallScore} grade={payload.grade} isFallback={payload.isFallback} levelBreakdown={payload.levelBreakdown} />
          </div>
          
          <div className="p-6 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl">
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[hsl(var(--color-text-secondary))] mb-4">
              Level Breakdown
            </h3>
            <LevelBreakdown breakdown={payload.levelBreakdown} />
          </div>
        </div>

        {/* Center Panel - Heatmap and Issues */}
        <div className="lg:col-span-6 space-y-6">
          {/* Heatmap */}
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

          {/* Copy All Button - sticky on mobile, static on desktop */}
          <div className="md:flex md:justify-end">
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-[hsl(var(--color-bg-surface))] border-t border-[hsl(var(--color-border))] md:static md:p-0 md:bg-transparent md:border-0 z-50 md:z-auto">
              <div className="flex justify-end max-w-7xl mx-auto md:max-w-none">
                <CopyAllCriticalButton
                  payload={payload}
                  onModalOpen={() => setIsBatchModalOpen(true)}
                />
              </div>
            </div>
            {/* Spacer for mobile sticky bar */}
            <div className="h-28 md:hidden" />
          </div>

          {/* Issue List */}
          <IssueCardList
            issues={payload.issues}
            heatmapFilter={heatmapFilter}
            onClearHeatmapFilter={() => setHeatmapFilter(null)}
            selectedIssue={selectedIssue}
            onSelectIssue={setSelectedIssue}
            onOpenBeforeAfter={handleOpenBeforeAfter}
          />
        </div>

        {/* Right Panel - Issue Detail */}
        <div className="lg:col-span-3">
          <div className="sticky top-4 p-6 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl min-h-[400px]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-[hsl(var(--color-text-secondary))] mb-4">
              Issue Detail
            </h3>
            <IssueDetail issue={selectedIssue} onOpenBeforeAfter={handleOpenBeforeAfter} />
          </div>
        </div>
      </div>

      {/* Batch Prompt Modal */}
      <BatchPromptModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        promptText={promptText}
      />

      {/* Before/After Panel */}
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
