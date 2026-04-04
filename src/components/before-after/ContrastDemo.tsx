import type { ContrastDemoProps } from '@/lib/beforeAfterContent';

interface ContrastDemoComponentProps {
  content: ContrastDemoProps;
  isBefore: boolean;
}

export function ContrastDemo({ content, isBefore }: ContrastDemoComponentProps) {
  if (isBefore) {
    // Before panel - Current (failing)
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <p 
              style={{ color: content.failingColor }}
              className="text-lg font-medium"
            >
              {content.text}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: content.failingColor }}
              />
              <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                {content.failingColor}
              </span>
            </div>
            <span className="px-2 py-1 text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded">
              {content.failingRatio} ✗
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {content.criterionNote}
          </p>
        </div>
      </div>
    );
  }

  // After panel - Accessible (passing)
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <p 
            style={{ color: content.passingColor }}
            className="text-lg font-medium"
          >
            {content.text}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: content.passingColor }}
            />
            <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
              {content.passingColor}
            </span>
          </div>
          <span className="px-2 py-1 text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded">
            {content.passingRatio} ✓
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {content.criterionNote}
        </p>
      </div>
    </div>
  );
}
