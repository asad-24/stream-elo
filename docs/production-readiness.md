# Meroestream Production Readiness

## Current Status

- Public frontend routes exist and build successfully.
- MongoDB Atlas contact inquiry storage exists through `POST /api/contact`.
- Health check exists at `GET /api/health`.
- Admin dashboard, authentication, full CMS CRUD, publishing workflow, email notifications, and media upload management are not present in this repository yet.
- `.env.local` is ignored by Git. `.env.example` contains placeholders only.

## Checklist

- [x] Inspect repository and current routes.
- [x] Confirm secrets are not committed.
- [x] Add production env placeholder guide.
- [x] Add security headers.
- [x] Add robots and XML sitemap generation.
- [x] Add 301 redirects for known old URLs.
- [x] Add Organization structured data.
- [x] Add contact API rate limiting.
- [x] Add MongoDB health endpoint.
- [x] Run lint, typecheck, and production build.
- [ ] Implement admin dashboard and CMS, or explicitly remove it from launch scope.
- [ ] Implement authentication and role-based authorization.
- [ ] Add SMTP notification emails.
- [ ] Configure production hosting environment variables.
- [ ] Configure production domain only after preview deployment is verified.
- [ ] Run browser/device QA with Chrome, Safari, Firefox, Edge, iOS Safari, and Android Chrome.
- [ ] Run Lighthouse and address critical issues.
- [ ] Create external backup of old site before DNS changes.
- [ ] Rotate any credentials that were shared outside a password manager.

## Incomplete Or Placeholder Content

- Final public email must be confirmed: `hello@meroestream.com` vs `info@meroestream.com`.
- Several biographies, credits, cast lists, project dates, and production metadata are placeholders in `src/lib/content.ts`.
- BTS galleries use available public images as placeholders where final stills are missing.
- Admin guide is blocked until admin/CMS routes are implemented.

## Security Risks To Resolve Before Production

- Rotate the MongoDB Atlas password that was shared during setup.
- Restrict Atlas network access to deployment provider egress IPs where possible. If using Vercel without static egress, use a provider configuration compatible with serverless access and strong credentials.
- Add authentication before creating any `/admin` route.
- Add SMTP credentials only as environment variables in the hosting dashboard.
- Do not use cPanel/FTP passwords in code or docs.

## Hosting Requirement Summary

- Requires Node.js capable of running Next.js 16 App Router.
- Requires environment variables.
- Requires outbound MongoDB Atlas connectivity.
- Requires serverless/functions or a persistent Node server for API routes.
- Requires CDN delivery for large videos.
