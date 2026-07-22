# Drive Media Import Report

Status: pending credentials

The import script scaffold exists at:

```text
scripts/import-existing-drive-media.ts
```

Current result:

- No Drive media has been imported yet.
- The supplied Google Drive folder links are folders, not direct file URLs.
- Folder listing requires Google Drive API credentials.
- After credentials are configured, the importer should list configured folders, validate file access, read metadata, avoid duplicate Drive file IDs, and create MongoDB media records.

Known supplied folders:

```text
Artefacts folder ID: 1YJcHwuAvvQNeZiT4cnVm_VyTaUSNn2P3
Edited videos folder ID: 1d2zIfC6a4uZNxJNOjQJOCleiN819n4Sx
```

No files were deleted or modified in Google Drive.
