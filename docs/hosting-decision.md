# Hosting Decision Report

## Option A: Namecheap Shared Hosting

Namecheap documentation says cPanel shared hosting can create Node.js apps, choose Node versions, set environment variables, run npm install, and start/restart apps. Their Next.js guide also requires a custom `server.js` and notes the app cannot be placed directly in `public_html`.

This can work for simple Next.js apps, but it is higher-risk for this project because it depends on shared-hosting Node support, process reliability, logs, MongoDB outbound connectivity, and manual deployments.

## Option B: Vercel + Namecheap Domain/Email

Recommended.

- Deploy Next.js on Vercel.
- Keep domain registration and email at Namecheap.
- Use MongoDB Atlas as the production database.
- Point DNS records from Namecheap to Vercel after preview verification.
- Configure environment variables in Vercel.
- Use Vercel previews for QA before DNS cutover.

This is the safest fit for Next.js App Router, dynamic API routes, image optimization, serverless deployment, HTTPS, rollbacks, and preview URLs.

## Option C: VPS

Use a VPS only if the project grows into persistent background workers, media processing, custom reverse proxy requirements, advanced logs, or scheduled jobs that exceed Vercel/serverless needs.

## Recommendation

Use Vercel for the Next.js application, MongoDB Atlas for data, and a CDN/object storage provider for videos. Keep Namecheap for domain and email unless the client wants to migrate those too.

Do not point DNS to production until the Vercel preview URL has passed QA and old-site backups are complete.
