/**
 * WCAG Contrast Calculation Utilities
 * Pure client-side, zero dependencies
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface TokenDefinition {
  name: string;
  value: string;
  rgb: RgbColor | null;
  isValid: boolean;
  error?: string;
}

export interface ContrastResult {
  tokenA: string;
  tokenB: string;
  ratio: number;
  aaText: boolean;
  aaLarge: boolean;
  aaUI: boolean;
}

export interface ContrastMatrix {
  tokens: TokenDefinition[];
  pairs: ContrastResult[];
  failingCount: number;
  totalCount: number;
}

/**
 * Parse hex color to RGB
 * Supports 3-digit (#RGB) and 6-digit (#RRGGBB) hex
 */
export function hexToRgb(hex: string): RgbColor | null {
  const clean = hex.replace('#', '').trim();

  // Validate hex format
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(clean)) {
    return null;
  }

  // Expand 3-digit to 6-digit
  const full = clean.length === 3
    ? clean.split('').map(c => c + c).join('')
    : clean;

  const n = parseInt(full, 16);

  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

/**
 * Calculate relative luminance per WCAG 2.2
 * https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */
export function relativeLuminance(color: RgbColor): number {
  const [r, g, b] = [color.r, color.g, color.b].map((c) => {
    const s = c / 255;
    return s <= 0.04045
      ? s / 12.92
      : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

/**
 * Calculate contrast ratio between two luminances
 * Ratio is always >= 1 (lighter / darker)
 */
export function contrastRatio(lum1: number, lum2: number): number {
  const [L1, L2] = [lum1, lum2].sort((a, b) => b - a);
  return parseFloat(((L1 + 0.05) / (L2 + 0.05)).toFixed(2));
}

/**
 * Calculate contrast between two hex colors
 */
export function calculateContrast(hex1: string, hex2: string): number | null {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) {
    return null;
  }

  const lum1 = relativeLuminance(rgb1);
  const lum2 = relativeLuminance(rgb2);

  return contrastRatio(lum1, lum2);
}

/**
 * WCAG AA thresholds
 * - AA Text: 4.5:1 (normal text)
 * - AA Large: 3:1 (18pt+ text or 14pt+ bold)
 * - AA UI: 3:1 (non-text content like icons, buttons)
 */
export const WCAG_THRESHOLDS = {
  aaText: 4.5,
  aaLarge: 3.0,
  aaUI: 3.0,
} as const;

/**
 * Check if contrast passes WCAG AA thresholds
 */
export function checkWcagCompliance(ratio: number): {
  aaText: boolean;
  aaLarge: boolean;
  aaUI: boolean;
} {
  return {
    aaText: ratio >= WCAG_THRESHOLDS.aaText,
    aaLarge: ratio >= WCAG_THRESHOLDS.aaLarge,
    aaUI: ratio >= WCAG_THRESHOLDS.aaUI,
  };
}

/**
 * Parse CSS custom properties from text
 * Extracts --name: #value; patterns
 */
export function parseCssTokens(cssText: string): TokenDefinition[] {
  const tokens: TokenDefinition[] = [];

  // Match CSS custom property declarations: --name: value;
  const regex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let match;

  while ((match = regex.exec(cssText)) !== null) {
    const name = match[1];
    const value = match[2].trim();

    // Check if value is a hex color
    const hexMatch = value.match(/^#[0-9a-fA-F]{3,6}$/);

    if (hexMatch) {
      const rgb = hexToRgb(value);
      tokens.push({
        name,
        value,
        rgb,
        isValid: rgb !== null,
      });
    } else {
      // Non-hex value - flag as skipped
      tokens.push({
        name,
        value,
        rgb: null,
        isValid: false,
        error: 'Non-hex value — convert to hex for full analysis',
      });
    }
  }

  return tokens;
}

/**
 * Generate all color pairs and their contrast ratios
 */
export function generateContrastMatrix(tokens: TokenDefinition[]): ContrastResult[] {
  const pairs: ContrastResult[] = [];

  for (let i = 0; i < tokens.length; i++) {
    for (let j = 0; j < tokens.length; j++) {
      const tokenA = tokens[i];
      const tokenB = tokens[j];

      // Skip if either token is invalid
      if (!tokenA.isValid || !tokenB.isValid) {
        continue;
      }

      // Calculate contrast
      const lumA = relativeLuminance(tokenA.rgb!);
      const lumB = relativeLuminance(tokenB.rgb!);
      const ratio = contrastRatio(lumA, lumB);
      const compliance = checkWcagCompliance(ratio);

      pairs.push({
        tokenA: tokenA.name,
        tokenB: tokenB.name,
        ratio,
        ...compliance,
      });
    }
  }

  return pairs;
}

/**
 * Build full contrast matrix from CSS text
 */
export function buildContrastMatrix(cssText: string): ContrastMatrix {
  const tokens = parseCssTokens(cssText);
  const validTokens = tokens.filter(t => t.isValid);
  const pairs = generateContrastMatrix(validTokens);

  const failingCount = pairs.filter(p => !p.aaText).length;
  const totalCount = pairs.length;

  return {
    tokens: validTokens,
    pairs,
    failingCount,
    totalCount,
  };
}

/**
 * Auto-correct a color to meet 4.5:1 contrast against reference
 * Adjusts lightness in HSL space up to 20 points
 */
export function autoCorrectColor(
  colorHex: string,
  referenceHex: string
): { corrected: string | null; originalRatio: number; newRatio: number } {
  const colorRgb = hexToRgb(colorHex);
  const referenceRgb = hexToRgb(referenceHex);

  if (!colorRgb || !referenceRgb) {
    return { corrected: null, originalRatio: 0, newRatio: 0 };
  }

  const originalLum = relativeLuminance(colorRgb);
  const referenceLum = relativeLuminance(referenceRgb);
  const originalRatio = contrastRatio(originalLum, referenceLum);

  // If already passes, no correction needed
  if (originalRatio >= WCAG_THRESHOLDS.aaText) {
    return { corrected: null, originalRatio, newRatio: originalRatio };
  }

  // Try adjusting lightness
  const originalHsl = rgbToHsl(colorRgb.r, colorRgb.g, colorRgb.b);

  for (let delta = 1; delta <= 20; delta++) {
    // Try lightening
    const lightened = { ...originalHsl, l: Math.min(100, originalHsl.l + delta) };
    const lightenedRgb = hslToRgb(lightened.h, lightened.s, lightened.l);
    const lightenedLum = relativeLuminance(lightenedRgb);
    const lightenedRatio = contrastRatio(lightenedLum, referenceLum);

    if (lightenedRatio >= WCAG_THRESHOLDS.aaText) {
      return {
        corrected: rgbToHex(lightenedRgb),
        originalRatio,
        newRatio: lightenedRatio,
      };
    }

    // Try darkening
    const darkened = { ...originalHsl, l: Math.max(0, originalHsl.l - delta) };
    const darkenedRgb = hslToRgb(darkened.h, darkened.s, darkened.l);
    const darkenedLum = relativeLuminance(darkenedRgb);
    const darkenedRatio = contrastRatio(darkenedLum, referenceLum);

    if (darkenedRatio >= WCAG_THRESHOLDS.aaText) {
      return {
        corrected: rgbToHex(darkenedRgb),
        originalRatio,
        newRatio: darkenedRatio,
      };
    }
  }

  // Could not reach 4.5:1 within 20 lightness points
  return { corrected: null, originalRatio, newRatio: originalRatio };
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
    default:
      h = 0;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): RgbColor {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(rgb: RgbColor): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, n)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Generate corrected CSS tokens file content
 */
export function generateCorrectedTokens(
  cssText: string,
  matrix: ContrastMatrix
): string {
  const tokens = parseCssTokens(cssText);
  const output: string[] = [];
  const corrections = new Map<string, string>();

  // Find the most common background color to use as reference
  // Typically --color-bg-base or --color-bg-surface
  const bgToken = tokens.find(t =>
    t.name.includes('bg-base') ||
    t.name.includes('bg-surface') ||
    t.name.includes('background')
  ) || tokens[0];

  if (bgToken && bgToken.isValid) {
    // Generate corrections for failing text colors
    for (const token of tokens) {
      if (!token.isValid) {
        output.push(`/* ${token.name}: ${token.error} */`);
        continue;
      }

      // Check contrast against background
      const pair = matrix.pairs.find(p =>
        p.tokenA === token.name && p.tokenB === bgToken.name
      );

      if (pair && !pair.aaText) {
        const correction = autoCorrectColor(token.value, bgToken.value);

        if (correction.corrected) {
          corrections.set(token.name, correction.corrected);
          output.push(`${token.name}: ${correction.corrected}; /* adjusted from ${token.value} — was ${correction.originalRatio}:1, now ${correction.newRatio}:1 */`);
        } else {
          output.push(`${token.name}: ${token.value}; /* could not auto-fix — manual adjustment required */`);
        }
      } else {
        output.push(`${token.name}: ${token.value};`);
      }
    }
  }

  return output.join('\n');
}
