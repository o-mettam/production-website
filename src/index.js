// Security headers applied to every response
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

function applySecurityHeaders(response) {
  const newResponse = new Response(response.body, response);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    newResponse.headers.set(key, value);
  }
  return newResponse;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const key = `rate:${ip}`;

    // Rate limit configuration
    // Note: Cloudflare KV requires expirationTtl >= 60 seconds
    const LIMIT = 100;  // max requests per window
    const WINDOW = 60;  // window in seconds (minimum 60 for KV)

    try {
      // Check current request count for this IP
      const current = await env.RATE_LIMIT.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= LIMIT) {
        // Serve the 429 page with proper status
        const page = await env.ASSETS.fetch(new URL('/429.html', url.origin));
        return applySecurityHeaders(new Response(page.body, {
          status: 429,
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Retry-After': String(WINDOW),
          },
        }));
      }

      // Increment counter with TTL (auto-expires after the window)
      await env.RATE_LIMIT.put(key, String(count + 1), {
        expirationTtl: WINDOW,
      });
    } catch (err) {
      // If rate limiting fails, allow the request through
      console.error('Rate limit error:', err.message);
    }

    // Pass through to static assets
    const response = await env.ASSETS.fetch(request);
    return applySecurityHeaders(response);
  },
};
