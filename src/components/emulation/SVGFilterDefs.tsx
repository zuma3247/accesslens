import { createPortal } from 'react-dom';
import { IMPAIRMENT_FILTERS } from '@/data/impairmentFilters';

export function SVGFilterDefs() {
  const svgFilters = IMPAIRMENT_FILTERS
    .filter(f => f.svgFilter !== null)
    .map(f => f.svgFilter)
    .join('\n');

  return createPortal(
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: `<defs>${svgFilters}</defs>` }}
    />,
    document.body
  );
}
