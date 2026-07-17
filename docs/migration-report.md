# Existing Website Migration Report

## Source Reviewed

- Current public site: `https://meroestream.com`
- Public WordPress REST pages list
- Public media library entries exposed by WordPress REST
- Public `robots.txt`
- Google Drive folder listing where accessible

## Current Important URLs

- `/`
- `/about-us`
- `/portfolio`
- `/portfolio-2-2`
- `/videos`
- `/photos`
- `/photos-4`
- `/contact-us`
- `/video-production`
- `/services`
- `/podcast-studio`
- `/consultation`
- `/virginia`
- `/west-virginia`
- `/studio-policies`
- `/privacy-policy-2`
- `/terms-of-service`

## Redirects Implemented

- `/about-us` -> `/about`
- `/contact-us` -> `/contact`
- `/portfolio-2-2` -> `/portfolio`
- `/photos` -> `/behind-the-scenes`
- `/photos-4` -> `/behind-the-scenes`
- `/videos` -> `/films`
- `/video-production` -> `/portfolio`
- `/services` -> `/portfolio`
- `/podcast-studio` -> `/portfolio`
- `/consultation` -> `/contact`
- `/virginia` -> `/contact`
- `/west-virginia` -> `/contact`
- `/studio-policies` -> `/contact`
- `/privacy-policy-2` -> `/contact`
- `/terms-of-service` -> `/contact`

## Migrated Or Reused Content

- Public logo/media URLs from the existing site.
- Public project imagery and poster assets from the WordPress media library.
- Public MP4 video references currently served from `meroestream.com`.
- Brand palette and editorial direction from the available brand PDF.
- Contact addresses and telephone from the client brief.

## Missing Or Requires Client Confirmation

- Old hosting file/database backup from IONOS or Hostinger/cPanel.
- Complete SEO export from the old WordPress installation.
- Current analytics scripts and Search Console verification ownership.
- Existing form submissions or CRM records.
- Email routing configuration.
- Final legal pages: privacy policy, terms, studio policy, script policy.
- Final production metadata, galleries, and videos.

## Backup Procedure Before DNS Change

1. Log in to the old hosting panel.
2. Export website files and uploads.
3. Export any database with phpMyAdmin or hosting backup tools.
4. Download `robots.txt`, sitemap, favicon, logos, uploads, and redirect rules.
5. Record active DNS records, MX records, TXT verification records, and analytics snippets.
6. Store the backup outside the hosting account.
7. Do not delete old hosting until the new site is verified on production DNS.
