# Backup And Restore Guide

## MongoDB Atlas

- Enable scheduled Atlas backups if available on the selected plan.
- Before major releases, create an on-demand snapshot.
- Export important collections before destructive CMS operations.
- Test restore into a staging database before restoring production.

## Website Source

- Keep source code in Git.
- Tag production releases.
- Keep `.env.local` and production environment values outside Git.

## Old Website

- Download full files and database before DNS changes.
- Save DNS records and email records.
- Save analytics and Search Console verification records.
- Store old backup in cloud storage controlled by the client.

## Media

- Keep original video masters in client storage.
- Keep web/CDN renditions in object storage with backup lifecycle rules.
- Document source file, web rendition, poster, and page usage.
