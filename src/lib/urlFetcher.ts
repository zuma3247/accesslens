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
  // Use our proxy endpoint to bypass CORS
  const proxyUrl = `/api/fetch-page?url=${encodeURIComponent(url)}`;
  
  const response = await fetch(proxyUrl, {
    method: 'GET',
    headers: {
      Accept: 'text/html',
    },
  });

  if (!response.ok) {
    // Try to parse error response
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // If not JSON, use status text
      errorMessage = `${errorMessage}: ${response.statusText}`;
    }
    throw new Error(`Proxy fetch failed (${errorMessage})`);
  }

  const html = await response.text();
  const finalUrl = url; // We know the original URL since we're proxying

  if (!html || !/<html|<body|<!doctype/i.test(html)) {
    throw new Error('Fetched content did not look like HTML');
  }

  // Inject base tag to resolve relative assets against the original directory path
  // (not just the origin — relative URLs like "img/hero.jpg" need the full path prefix)
  const parsedFinalUrl = new URL(finalUrl);
  const baseHref = parsedFinalUrl.href.substring(0, parsedFinalUrl.href.lastIndexOf('/') + 1) || parsedFinalUrl.origin;
  const htmlWithBase = injectBaseTag(html, baseHref);

  return { html: htmlWithBase, finalUrl };
}

function injectBaseTag(html: string, baseHref: string): string {
  // Check if base tag already exists
  const baseTagMatch = html.match(/<base\s+[^>]*>/i);
  if (baseTagMatch) {
    // Update existing base tag
    return html.replace(
      /<base\s+([^>]*)>/i,
      `<base $1 href="${baseHref}">`
    );
  }

  // Insert new base tag after <head> or at the beginning if no head
  const headMatch = html.match(/<head([^>]*)>/i);
  if (headMatch) {
    return html.replace(
      headMatch[0],
      `${headMatch[0]}\n  <base href="${baseHref}">`
    );
  }

  // If no head tag, insert after <html> or at the very beginning
  const htmlMatch = html.match(/<html([^>]*)>/i);
  if (htmlMatch) {
    return html.replace(
      htmlMatch[0],
      `${htmlMatch[0]}\n<head>\n  <base href="${baseHref}">\n</head>`
    );
  }

  // Fallback: prepend at the very beginning
  return `<head><base href="${baseHref}"></head>${html}`;
}

export async function fetchUrlHtml(rawUrl: string): Promise<UrlFetchResult> {
  const url = ensureProtocol(rawUrl);
  return fetchDirect(url);
}
