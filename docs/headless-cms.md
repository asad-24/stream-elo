# Headless CMS Operations

## Database setup

Run the versioned migrations and idempotent content seed before opening the CMS:

```text
npm run db:migrate
npm run db:migrate:status
npm run db:seed
```

The migration runner records completed versions in `schema_migrations`. The seed
imports the current website content as published records and preserves records
that already exist.

## Publishing and roles

- Editors create and update drafts and upload media.
- Admins additionally publish and unpublish content and media.
- Super-admins additionally create users and hard-delete records.
- Referenced R2 media is archived instead of deleted. Unreferenced media is
  deleted from R2 and MongoDB together.

## REST routes

Admin CRUD is available under `/api/admin/content/<resource>` for `projects`,
`categories`, `pages`, `page-sections`, `success-stories`, `bts-projects`,
`galleries`, `statistics`, and `benefits`. Item routes use `/<id>`, publishing
uses `/<id>/publish`, and ordering uses `/reorder`.

Media uses `/api/admin/media`, `/api/admin/media/<id>`, and
`/api/admin/media/<id>/publish`. Browser-to-R2 uploads use:

```text
POST /api/admin/r2/uploads/initiate
POST /api/admin/r2/uploads/complete
POST /api/admin/r2/uploads/abort
```

Published public data is exposed from `/api/v1/pages/<slug>`,
`/api/v1/pages/<slug>/sections`, `/api/v1/projects`,
`/api/v1/projects/<slug>`, `/api/v1/success-stories`,
`/api/v1/bts-projects`, `/api/v1/galleries/<slug>`, and
`/api/v1/site-settings`.

## R2 directories

Local development uses `R2_OBJECT_PREFIX=dev`; production must set it to
`production`. Files are generated under:

```text
<environment>/images/YYYY/MM/<slug>-<uuid>.<ext>
<environment>/videos/YYYY/MM/<slug>-<uuid>.<ext>
```

The application derives the private S3 endpoint from `R2_ACCOUNT_ID`:
`https://<account-id>.r2.cloudflarestorage.com`. Public playback uses
`R2_PUBLIC_BASE_URL`, which should be the connected R2 custom domain.
