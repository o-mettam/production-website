# Owen Mettam - Professional Portfolio Website

A modern, responsive personal portfolio website built with HTML, TailwindCSS, and JavaScript, deployed on Cloudflare Workers.

## Features

- **Modern Design**: Clean, professional layout with indigo accent theme
- **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode**: System-aware dark mode with manual toggle and persistence
- **Interactive Elements**: Scroll-triggered reveal animations, hover effects, and transitions
- **Smooth Scrolling**: Navigation with smooth scroll behavior
- **Mobile Menu**: Accessible hamburger menu with keyboard support (Escape to close, focus trapping)
- **Page Loader**: Animated loading spinner with noscript fallback
- **Print Stylesheet**: Optimized layout for printing
- **GitHub Contributions**: Live contribution chart from GitHub
- **Rate Limiting**: IP-based rate limiting via Cloudflare Workers KV
- **Security Headers**: HSTS, X-Frame-Options, CSP-adjacent headers on all responses
- **Custom Error Pages**: Styled 401, 403, 404, 429, 500, and 503 pages

## Structure

- `index.html` - Main HTML structure with semantic markup
- `script.js` - JavaScript for interactivity, animations, and accessibility
- `src/index.js` - Cloudflare Worker (rate limiting + security headers)
- `wrangler.jsonc` - Cloudflare Workers configuration
- `*.html` (401, 403, 404, 429, 500, 503) - Custom error pages

## Sections

1. **Hero**: Introduction with photo, tagline, and call-to-action buttons
2. **About**: Personal summary and professional overview
3. **Experience**: Professional work history with timeline layout
4. **Education**: Academic background
5. **Certifications**: Professional certifications with logos
6. **Skills & Expertise**: Categorized skill tags (AI, Networking, Collaboration, Tools, Communication)
7. **GitHub Contributions**: Live contribution chart
8. **Contact**: Contact information and social links

## Technologies Used

- HTML5 Semantic Markup
- TailwindCSS (CDN) for styling
- Vanilla JavaScript for interactivity
- Font Awesome for icons
- Google Fonts (Inter) for typography
- Cloudflare Workers for edge compute
- Cloudflare Workers KV for rate limiting

## Getting Started

1. Clone or download the files
2. Install Wrangler: `npm install wrangler`
3. Run locally: `npx wrangler dev`
4. Deploy: `npx wrangler deploy`

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge
