import { describe, it, expect } from 'vitest';
import { getSeedForUrl } from '../filterMatcher';

describe('getSeedForUrl', () => {
  it('matches all five known URLs', async () => {
    const urls = [
      'demo.accesslens.app/ecommerce',
      'demo.accesslens.app/dashboard',
      'demo.accesslens.app/healthcare',
      'demo.accesslens.app/login',
      'demo.accesslens.app/clean',
    ];

    for (const url of urls) {
      const { payload, isFallback } = await getSeedForUrl(url);
      expect(payload).toBeDefined();
      expect(isFallback).toBe(false);
      expect(payload.auditedInput).toBe(url);
    }
  });

  it('returns ecommerce seed for unrecognized URL with isFallback true', async () => {
    const { payload, isFallback } = await getSeedForUrl('demo.accesslens.app/unknown');
    expect(payload).toBeDefined();
    expect(isFallback).toBe(true);
    expect(payload.auditedInput).toBe('demo.accesslens.app/ecommerce');
  });

  it('normalizes URL with trailing slash', async () => {
    const { payload } = await getSeedForUrl('demo.accesslens.app/dashboard/');
    expect(payload).toBeDefined();
    expect(payload.auditedInput).toBe('demo.accesslens.app/dashboard');
  });

  it('normalizes URL with https:// prefix', async () => {
    const { payload } = await getSeedForUrl('https://demo.accesslens.app/dashboard');
    expect(payload).toBeDefined();
    expect(payload.auditedInput).toBe('demo.accesslens.app/dashboard');
  });

  it('normalizes URL with http:// prefix', async () => {
    const { payload } = await getSeedForUrl('http://demo.accesslens.app/dashboard');
    expect(payload).toBeDefined();
    expect(payload.auditedInput).toBe('demo.accesslens.app/dashboard');
  });

  it('is case insensitive', async () => {
    const { payload } = await getSeedForUrl('DEMO.ACCESSLENS.APP/DASHBOARD');
    expect(payload).toBeDefined();
    expect(payload.auditedInput).toBe('demo.accesslens.app/dashboard');
  });
});
