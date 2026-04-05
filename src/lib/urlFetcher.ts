interface UrlFetchResult {
  html: string;
  finalUrl: string;
}

function ensureProtocol(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

async function fetchDirect(url: string): Promise<UrlFetchResult> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Direct fetch failed (${response.status})`);
  }

  const html = await response.text();
  const finalUrl = response.url || url;

  if (!html || !/<html|<body|<!doctype/i.test(html)) {
    throw new Error('Fetched content did not look like HTML');
  }

  return { html, finalUrl };
}

export async function fetchUrlHtml(rawUrl: string): Promise<UrlFetchResult> {
  const url = ensureProtocol(rawUrl);
  return fetchDirect(url);
}
