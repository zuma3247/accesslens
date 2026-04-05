interface VercelRequestLike {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
}

interface VercelResponseLike {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponseLike;
  json: (body: unknown) => void;
  send: (body: string) => void;
  end: () => void;
}

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
];

function getHeaderValue(
  headers: Record<string, string | string[] | undefined> | undefined,
  key: string
): string | null {
  const value = headers?.[key];
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0) return value[0];
  return null;
}

function getRequestUrl(req: VercelRequestLike): URL | null {
  if (!req.url) return null;

  try {
    return new URL(req.url);
  } catch {
    const host = getHeaderValue(req.headers, 'host') ?? 'localhost';
    const protocol = getHeaderValue(req.headers, 'x-forwarded-proto') ?? 'https';
    return new URL(req.url, `${protocol}://${host}`);
  }
}

function setCorsHeaders(res: VercelResponseLike): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function isValidUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS URLs are allowed' };
    }

    const hostname = parsed.hostname;
    for (const pattern of PRIVATE_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return { valid: false, error: 'Private IP addresses are not allowed' };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const requestUrl = getRequestUrl(req);
  const rawUrl = requestUrl?.searchParams.get('url') ?? null;
  if (!rawUrl) {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }

  const validation = isValidUrl(rawUrl);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  try {
    // Avoid "Chrome/... Safari/..." in UA — some sites (notably w3.org) respond 403 to that pattern from server-side fetch.
    const response = await fetch(rawUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      res.status(response.status).json({ error: `HTTP ${response.status}: ${response.statusText}` });
      return;
    }

    const html = await response.text();
    if (!html || !/<html|<body|<!doctype/i.test(html)) {
      res.status(400).json({ error: 'URL did not return valid HTML content' });
      return;
    }

    // Prevent CDN/browser from revalidating with 304 + empty body (breaks fetch().text() on the client).
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      res.status(408).json({ error: 'Request timeout (10s limit)' });
      return;
    }

    res.status(500).json({ error: 'Failed to fetch URL' });
  }
}
