import { getSeedForUrl } from './filterMatcher';

test('matches all five known URLs', async () => {
  const urls = [
    'demo.accesslens.app/ecommerce',
    'demo.accesslens.app/dashboard',
    'demo.accesslens.app/healthcare',
    'demo.accesslens.app/login',
    'demo.accesslens.app/clean',
  ];

  for (const url of urls) {
    const result = await getSeedForUrl(url);
    expect(result).toBeDefined();
    expect(result.auditedInput).toBe(url);
  }
});

test('returns ecommerce seed for unrecognized URL', async () => {
  const result = await getSeedForUrl('demo.accesslens.app/unknown');
  expect(result).toBeDefined();
  expect(result.auditedInput).toBe('demo.accesslens.app/ecommerce');
});

test('normalizes URL with trailing slash', async () => {
  const result = await getSeedForUrl('demo.accesslens.app/dashboard/');
  expect(result).toBeDefined();
  expect(result.auditedInput).toBe('demo.accesslens.app/dashboard');
});

test('normalizes URL with https:// prefix', async () => {
  const result = await getSeedForUrl('https://demo.accesslens.app/dashboard');
  expect(result).toBeDefined();
  expect(result.auditedInput).toBe('demo.accesslens.app/dashboard');
});

test('normalizes URL with http:// prefix', async () => {
  const result = await getSeedForUrl('http://demo.accesslens.app/dashboard');
  expect(result).toBeDefined();
  expect(result.auditedInput).toBe('demo.accesslens.app/dashboard');
});

test('is case insensitive', async () => {
  const result = await getSeedForUrl('DEMO.ACCESSLENS.APP/DASHBOARD');
  expect(result).toBeDefined();
  expect(result.auditedInput).toBe('demo.accesslens.app/dashboard');
});
