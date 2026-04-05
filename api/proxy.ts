// Vercel serverless function API route
// Note: This uses Vercel's runtime API, not Next.js

// Security: Block private IP ranges and localhost
const PRIVATE_IP_PATTERNS = [
  /^127\./,      // 127.0.0.0/8 (localhost)
  /^10\./,       // 10.0.0.0/8 (private)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12 (private)
  /^192\.168\./, // 192.168.0.0/16 (private)
  /^169\.254\./, // 169.254.0.0/16 (link-local)
  /^::1$/,       // IPv6 localhost
  /^fc00:/,      // IPv6 unique local
  /^fe80:/,      // IPv6 link-local
];

function isValidUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS URLs are allowed' };
    }
    
    // Block private IPs and localhost
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

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const rawUrl = url.searchParams.get('url');
  
  if (!rawUrl) {
    return Response.json(
      { error: 'Missing url parameter' },
      { status: 400 }
    );
  }
  
  // Validate URL
  const validation = isValidUrl(rawUrl);
  if (!validation.valid) {
    return Response.json(
      { error: validation.error },
      { status: 400 }
    );
  }
  
  try {
    // Add rate limiting headers
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=300', // 5 minutes cache
    });
    
    // Fetch the URL with browser-like headers
    const response = await fetch(rawUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!response.ok) {
      return Response.json(
        { error: `HTTP ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const html = await response.text();
    
    // Basic validation that we got HTML
    if (!html || !/<html|<body|<!doctype/i.test(html)) {
      return Response.json(
        { error: 'URL did not return valid HTML content' },
        { status: 400 }
      );
    }
    
    // Return the HTML with appropriate headers
    return new Response(html, {
      status: 200,
      headers,
    });
    
  } catch (error) {
    console.error('Proxy fetch error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return Response.json(
          { error: 'Request timeout (10s limit)' },
          { status: 408 }
        );
      }
      
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        return Response.json(
          { error: 'Unable to connect to the specified URL' },
          { status: 502 }
        );
      }
    }
    
    return Response.json(
      { error: 'Failed to fetch URL' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
