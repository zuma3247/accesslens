import type { ImpairmentFilter } from '@/types/audit.types';

export const IMPAIRMENT_FILTERS: ImpairmentFilter[] = [
  {
    key: 'none',
    label: 'None',
    description: 'Default rendering — no vision simulation active.',
    prevalence: '',
    filterId: '',
    svgFilter: null,
    cssClass: null,
  },
  {
    key: 'achromatopsia',
    label: 'Achromatopsia',
    description: 'Complete absence of color perception. All colors appear as shades of gray.',
    prevalence: '~0.003% of the population',
    filterId: 'filter-achromatopsia',
    svgFilter: `<filter id="filter-achromatopsia" x="0" y="0" width="100%" height="100%">
  <feColorMatrix type="matrix" values="
    0.2126 0.7152 0.0722 0 0
    0.2126 0.7152 0.0722 0 0
    0.2126 0.7152 0.0722 0 0
    0      0      0      1 0"/>
</filter>`,
    cssClass: null,
  },
  {
    key: 'deuteranopia',
    label: 'Deuteranopia',
    description: 'Green-weak color vision. Red and green appear similar. The most common form of color blindness.',
    prevalence: '~5% of males',
    filterId: 'filter-deuteranopia',
    svgFilter: `<filter id="filter-deuteranopia" x="0" y="0" width="100%" height="100%">
  <feColorMatrix type="matrix" values="
     0.367  0.861 -0.228 0 0
     0.280  0.673  0.047 0 0
    -0.012  0.043  0.969 0 0
     0      0      0     1 0"/>
</filter>`,
    cssClass: null,
  },
  {
    key: 'protanopia',
    label: 'Protanopia',
    description: 'Red-weak color vision. Reds appear very dark and are difficult to distinguish from black.',
    prevalence: '~1% of males',
    filterId: 'filter-protanopia',
    svgFilter: `<filter id="filter-protanopia" x="0" y="0" width="100%" height="100%">
  <feColorMatrix type="matrix" values="
     0.152  1.053 -0.205 0 0
     0.115  0.786  0.099 0 0
    -0.004 -0.048  1.052 0 0
     0      0      0     1 0"/>
</filter>`,
    cssClass: null,
  },
  {
    key: 'tritanopia',
    label: 'Tritanopia',
    description: 'Blue-yellow color vision deficiency. Blues and greens become indistinguishable.',
    prevalence: '~0.008% of the population',
    filterId: 'filter-tritanopia',
    svgFilter: `<filter id="filter-tritanopia" x="0" y="0" width="100%" height="100%">
  <feColorMatrix type="matrix" values="
     1.256 -0.077 -0.179 0 0
    -0.078  0.931  0.148 0 0
     0.005  0.691  0.304 0 0
     0      0      0     1 0"/>
</filter>`,
    cssClass: null,
  },
  {
    key: 'macular',
    label: 'Macular Deg.',
    description: 'Age-related central vision loss. The center of the visual field is blurred or missing; peripheral vision remains.',
    prevalence: '~11 million Americans over age 60',
    filterId: 'filter-macular',
    svgFilter: null, // CSS implementation — see emulation.css
    cssClass: 'emulate-macular',
  },
];
