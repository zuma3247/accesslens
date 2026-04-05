import { ScoreRingSkeleton } from './ScoreRingSkeleton';
import { HeatmapSkeleton } from './HeatmapSkeleton';
import { CardSkeleton } from './CardSkeleton';
import { ProgressMessages } from './ProgressMessages';

export function SkeletonDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Progress Message Bar */}
      <div className="mb-8 py-4 border-b border-[hsl(var(--color-border))]">
        <ProgressMessages />
      </div>

      {/* Three Column Layout - mirrors ResultsDashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel - Score Overview */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl">
            <ScoreRingSkeleton />
          </div>

          <div className="p-6 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--color-text-secondary))] mb-4">
              Level Breakdown
            </h3>
            {/* Level breakdown skeleton */}
            <div className="space-y-3">
              {['Level A', 'Level AA', 'Level AAA'].map((level) => (
                <div key={level} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[hsl(var(--color-text-secondary))]">{level}</span>
                    <span className="skeleton-shimmer-static w-8 h-4 bg-[hsl(var(--color-border))] rounded" />
                  </div>
                  <div className="h-2 bg-[hsl(var(--color-border))] rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-[hsl(var(--color-border-strong))] skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Panel - Heatmap and Issues */}
        <div className="lg:col-span-6 space-y-6">
          {/* Heatmap */}
          <div className="p-6 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--color-text-secondary))] mb-4">
              Issue Heatmap
            </h3>
            <HeatmapSkeleton />
          </div>

          {/* Filter bar placeholder */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-32 h-8 bg-[hsl(var(--color-border))] rounded skeleton-shimmer" />
              <div className="w-32 h-8 bg-[hsl(var(--color-border))] rounded skeleton-shimmer" />
              <div className="w-24 h-8 bg-[hsl(var(--color-border))] rounded skeleton-shimmer" />
            </div>
            <div className="w-28 h-4 bg-[hsl(var(--color-border))] rounded skeleton-shimmer-static" />
          </div>

          {/* Copy All Button placeholder */}
          <div className="flex justify-end">
            <div className="w-48 h-10 bg-[hsl(var(--color-border))] rounded-lg skeleton-shimmer" />
          </div>

          {/* Issue List */}
          <CardSkeleton count={5} />
        </div>

        {/* Right Panel - Issue Detail */}
        <div className="lg:col-span-3">
          <div className="sticky top-4 p-6 bg-[hsl(var(--color-bg-surface))] border border-[hsl(var(--color-border))] rounded-xl min-h-[400px]">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[hsl(var(--color-text-secondary))] mb-4">
              Issue Detail
            </h3>
            {/* Empty state placeholder */}
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-[hsl(var(--color-border))] rounded-full skeleton-shimmer" />
              <div className="w-48 h-4 bg-[hsl(var(--color-border))] rounded skeleton-shimmer-static" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
