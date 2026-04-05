import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'proxy-middleware',
      configureServer(server) {
        server.middlewares.use('/api/proxy', async (req, res, next) => {
          if (req.method !== 'GET' && req.method !== 'OPTIONS') {
            return next();
          }

          // Handle OPTIONS preflight
          if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.writeHead(200);
            res.end();
            return;
          }

          try {
            const url = new URL(req.url!, `http://${req.headers.host}`);
            const rawUrl = url.searchParams.get('url');

            if (!rawUrl) {
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'Missing url parameter' }));
              return;
            }

            // Basic URL validation
            let parsedUrl;
            try {
              parsedUrl = new URL(rawUrl);
              if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                throw new Error('Only HTTP/HTTPS URLs are allowed');
              }
            } catch {
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'Invalid URL format' }));
              return;
            }

            // Fetch the URL
            // UA must not include "Chrome/... Safari/..." — some origins (e.g. w3.org) return 403 to that pattern from non-browser fetches.
            const response = await fetch(rawUrl, {
              method: 'GET',
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              },
              signal: AbortSignal.timeout(10000),
            });

            if (!response.ok) {
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(response.status);
              res.end(JSON.stringify({ 
                error: `HTTP ${response.status}: ${response.statusText}` 
              }));
              return;
            }

            const html = await response.text();

            // Basic HTML validation
            if (!html || !/<html|<body|<!doctype/i.test(html)) {
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(400);
              res.end(JSON.stringify({ 
                error: 'URL did not return valid HTML content' 
              }));
              return;
            }

            // Return the HTML
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(html);

          } catch (error) {
            console.error('Dev proxy error:', error);
            res.setHeader('Content-Type', 'application/json');
            
            if (error instanceof Error) {
              if (error.name === 'AbortError') {
                res.writeHead(408);
                res.end(JSON.stringify({ error: 'Request timeout (10s limit)' }));
                return;
              }
            }
            
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to fetch URL' }));
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          d3: ['d3-scale', 'd3-interpolate'],
          motion: ['framer-motion'],
          axe: ['axe-core'],
        },
      },
    },
  },
});
