import type { AltTextDemoProps } from '@/lib/beforeAfterContent';

interface AltTextDemoComponentProps {
  content: AltTextDemoProps;
  isBefore: boolean;
}

export function AltTextDemo({ content, isBefore }: AltTextDemoComponentProps) {
  if (isBefore) {
    // Before panel - Current (missing/empty alt text)
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Placeholder image */}
            <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mb-3">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Image placeholder</span>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <code className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                {content.failingAlt}
              </code>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Screen reader output:</span>
            <p className="mt-1 italic text-red-600 dark:text-red-400">"image" or silence</p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            WCAG 1.1.1 Non-text Content: All images must have descriptive alt text that conveys the same meaning as the visual content.
          </p>
        </div>
      </div>
    );
  }

  // After panel - Accessible (descriptive alt text)
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Placeholder image */}
          <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mb-3">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Image placeholder</span>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <code className="text-sm text-gray-700 dark:text-gray-300 font-mono">
              {content.passingAlt}
            </code>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Screen reader output:</span>
          <p className="mt-1 italic text-green-600 dark:text-green-400">"Image: Bar chart showing Q3 revenue by region. EMEA leads at 42%."</p>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          WCAG 1.1.1 Non-text Content: All images must have descriptive alt text that conveys the same meaning as the visual content.
        </p>
      </div>
    </div>
  );
}
