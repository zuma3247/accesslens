import type { AuditPayload } from '@/types/audit.types';

// Each seed is dynamically imported — Vite code-splits them into separate chunks
const URL_SEED_MAP: Record<string, () => Promise<{ default: AuditPayload }>> = {
  'demo.accesslens.app/ecommerce': () => import('@/data/seeds/audit-ecommerce.json').then(m => ({ default: m.default as AuditPayload })),
  'demo.accesslens.app/dashboard': () => import('@/data/seeds/audit-dashboard.json').then(m => ({ default: m.default as AuditPayload })),
  'demo.accesslens.app/healthcare': () => import('@/data/seeds/audit-healthcare.json').then(m => ({ default: m.default as AuditPayload })),
  'demo.accesslens.app/login': () => import('@/data/seeds/audit-login.json').then(m => ({ default: m.default as AuditPayload })),
  'demo.accesslens.app/clean': () => import('@/data/seeds/audit-clean.json').then(m => ({ default: m.default as AuditPayload })),
};

const FALLBACK_SEED = 'demo.accesslens.app/ecommerce';

export async function getSeedForUrl(rawUrl: string): Promise<AuditPayload> {
  // Normalize: strip protocol and trailing slash
  const normalized = rawUrl
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .toLowerCase();

  const loader = URL_SEED_MAP[normalized] ?? URL_SEED_MAP[FALLBACK_SEED];
  const module = await loader();
  return module.default;
}
