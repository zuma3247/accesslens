import { createPortal } from 'react-dom';
import { IMPAIRMENT_FILTERS } from '@/data/impairmentFilters';

const UNSAFE_SVG_MARKUP = [
  /<\s*script/i,
  /<\s*iframe/i,
  /<\s*foreignObject/i,
  /\bjavascript:/i,
  /\bon\w+\s*=/i,
];

function isSafeSvgFilterMarkup(markup: string): boolean {
  return !UNSAFE_SVG_MARKUP.some((pattern) => pattern.test(markup));
}

export function SVGFilterDefs() {
  const svgFilters = IMPAIRMENT_FILTERS
    .filter((f) => f.svgFilter !== null)
    .map((f) => f.svgFilter as string)
    .join('\n');

  const safe = isSafeSvgFilterMarkup(svgFilters);
  if (import.meta.env.DEV && !safe) {
    console.warn('[SVGFilterDefs] Filter markup failed safety checks; skipping injection.');
  }

  const html = safe ? `<defs>${svgFilters}</defs>` : '<defs></defs>';

  return createPortal(
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />,
    document.body,
  );
}
