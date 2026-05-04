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

    // Rate limit configuration
    // Note: Cloudflare KV requires expirationTtl >= 60 seconds
    const LIMIT = 30;           // max requests per window
    const WINDOW = 60;          // window in seconds (minimum 60 for KV)
    const BLOCK_DURATION = 300; // block abusive IPs for 5 minutes

    try {
      // Check if this IP is currently blocked from a previous violation
      const blockKey = `block:${ip}`;
      const blocked = await env.RATE_LIMIT.get(blockKey);

      if (blocked) {
        const page = await env.ASSETS.fetch(new URL('/429.html', url.origin));
        return applySecurityHeaders(new Response(page.body, {
          status: 429,
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Retry-After': String(BLOCK_DURATION),
          },
        }));
      }

      // Use a time-bucketed key so windows are deterministic and don't
      // drift with each put. The bucket rolls over every WINDOW seconds.
      const bucket = Math.floor(Date.now() / (WINDOW * 1000));
      const rateKey = `rate:${ip}:${bucket}`;

      const current = parseInt(await env.RATE_LIMIT.get(rateKey)) || 0;

      if (current >= LIMIT) {
        // Block the IP for BLOCK_DURATION to penalise sustained abuse.
        // Even with KV eventual consistency, this block propagates
        // quickly and persists far longer than a single window.
        await env.RATE_LIMIT.put(blockKey, '1', {
          expirationTtl: BLOCK_DURATION,
        });

        const page = await env.ASSETS.fetch(new URL('/429.html', url.origin));
        return applySecurityHeaders(new Response(page.body, {
          status: 429,
          headers: {
            'Content-Type': 'text/html;charset=UTF-8',
            'Retry-After': String(BLOCK_DURATION),
          },
        }));
      }

      // Increment counter. TTL of 2×WINDOW ensures the key outlives the
      // current bucket but still gets cleaned up. (120s >= 60s minimum)
      await env.RATE_LIMIT.put(rateKey, String(current + 1), {
        expirationTtl: WINDOW * 2,
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
