import axe from 'axe-core';
import type { AxeResults } from 'axe-core';

export async function runLiveAxeAudit(htmlString: string): Promise<AxeResults> {
  // Mount snippet in a detached container (never visually rendered)
  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true'); // hide from SR during audit
  container.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden';
  container.innerHTML = htmlString;
  document.body.appendChild(container);

  try {
    const results = await axe.run(container, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag22aa'],
      },
      reporter: 'v2',
    });
    return results;
  } finally {
    // Always remove the container, even if axe throws
    document.body.removeChild(container);
  }
}
