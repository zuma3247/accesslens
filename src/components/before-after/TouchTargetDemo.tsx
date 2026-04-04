import type { TouchTargetDemoProps } from '@/lib/beforeAfterContent';

interface TouchTargetDemoComponentProps {
  content: TouchTargetDemoProps;
  isBefore: boolean;
}

export function TouchTargetDemo({ content, isBefore }: TouchTargetDemoComponentProps) {
  if (isBefore) {
    // Before panel - Current (too small)
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <div className="relative">
              <button
                style={{ 
                  width: `${content.failingSize.width}px`, 
                  height: `${content.failingSize.height}px` 
                }}
                className="bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-xs"
              >
                ×
              </button>
              
              {/* Ruler overlay */}
              <div className="absolute -top-6 -left-6 right-6 bottom-6 pointer-events-none">
                <div className="relative w-full h-full">
                  {/* Horizontal ruler lines */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-red-300" />
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-red-300" />
                  {/* Vertical ruler lines */}
                  <div className="absolute top-0 left-0 bottom-0 w-px bg-red-300" />
                  <div className="absolute top-0 right-0 bottom-0 w-px bg-red-300" />
                  
                  {/* Dimension labels */}
                  <div className="absolute -top-5 left-0 text-xs text-red-600 font-medium">
                    {content.failingSize.height}px
                  </div>
                  <div className="absolute top-1/2 -right-12 -translate-y-1/2 text-xs text-red-600 font-medium">
                    {content.failingSize.width}px
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-2 py-1 text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded">
            {content.failingSize.width}×{content.failingSize.height}px — fails WCAG 2.5.8 (24×24px minimum)
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            WCAG 2.5.8 Target Size (Minimum): Touch targets must be at least 24×24px with at least 24px of spacing between adjacent targets.
          </p>
        </div>
      </div>
    );
  }

  // After panel - Accessible (meets minimum)
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <div className="relative">
            <button
              style={{ 
                width: `${content.passingSize.width}px`, 
                height: `${content.passingSize.height}px` 
              }}
              className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center text-xs"
            >
              ×
            </button>
            
            {/* Ruler overlay */}
            <div className="absolute -top-6 -left-6 right-6 bottom-6 pointer-events-none">
              <div className="relative w-full h-full">
                {/* Horizontal ruler lines */}
                <div className="absolute top-0 left-0 right-0 h-px bg-green-300" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-green-300" />
                {/* Vertical ruler lines */}
                <div className="absolute top-0 left-0 bottom-0 w-px bg-green-300" />
                <div className="absolute top-0 right-0 bottom-0 w-px bg-green-300" />
                
                {/* Dimension labels */}
                <div className="absolute -top-5 left-0 text-xs text-green-600 font-medium">
                  {content.passingSize.height}px
                </div>
                <div className="absolute top-1/2 -right-12 -translate-y-1/2 text-xs text-green-600 font-medium">
                  {content.passingSize.width}px
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-2 py-1 text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
          {content.passingSize.width}×{content.passingSize.height}px ✓
        </div>
      </div>

      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          WCAG 2.5.8 Target Size (Minimum): Touch targets must be at least 24×24px with at least 24px of spacing between adjacent targets.
        </p>
      </div>
    </div>
  );
}
