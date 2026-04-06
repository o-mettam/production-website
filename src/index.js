export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const key = `rate:${ip}`;

    // Rate limit configuration
    const LIMIT = 60;   // max requests per window
    const WINDOW = 60;  // window in seconds

    // Check current request count for this IP
    const current = await env.RATE_LIMIT.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= LIMIT) {
      // Serve the 429 page with proper status
      const page = await env.ASSETS.fetch(new URL('/429.html', url.origin));
      return new Response(page.body, {
        status: 429,
        headers: {
          'Content-Type': 'text/html;charset=UTF-8',
          'Retry-After': String(WINDOW),
        },
      });
    }

    // Increment counter with TTL (auto-expires after the window)
    await env.RATE_LIMIT.put(key, String(count + 1), {
      expirationTtl: WINDOW,
    });

    // Pass through to static assets
    return env.ASSETS.fetch(request);
  },
};
