# Deployment Guide

## Recommended Architecture

- App hosting: Vercel
- Database: MongoDB Atlas
- Domain: Namecheap DNS pointing to Vercel
- Email: Namecheap or chosen email provider
- Media: CDN/object storage for final large video files

## Pre-Deployment

1. Rotate any shared database passwords.
2. Confirm `.env.local` is ignored.
3. Create old-site backup.
4. Confirm final public email.
5. Confirm final media URLs.
6. Run local verification:

```bash
npm run lint
npm run typecheck
npm run build
```

## Vercel Deployment

1. Import the Git repository into Vercel.
2. Configure environment variables from `.env.example` with production values.
3. Deploy preview.
4. Test public routes, contact form, `/api/health`, video playback, and redirects.
5. Add `meroestream.com` and `www.meroestream.com` in Vercel Domains.
6. In Namecheap DNS, add the Vercel-provided apex A record and `www` CNAME record.
7. Keep MX/email records intact.
8. Verify SSL and canonical domain behavior.

## Rollback

- Use Vercel deployment history to promote the previous working deployment.
- Keep old hosting backup and DNS records until production is stable.
- Do not delete old hosting immediately after launch.

## Namecheap Shared Hosting Fallback

Use only after proving the cPanel environment supports the required Node.js version, environment variables, npm install, a custom startup file, MongoDB Atlas outbound connectivity, logging, and reliable restart behavior.
