const driveIdPattern = /^[A-Za-z0-9_-]{10,}$/;

function clean(value: string) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function isValidDriveFileId(value: string) {
  return driveIdPattern.test(value);
}

export function extractGoogleDriveFileId(value: string): string | null {
  const input = clean(value);

  if (!input) return null;

  if (isValidDriveFileId(input) && !input.includes("/")) {
    return input;
  }

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }

  if (!url.hostname.endsWith("google.com")) {
    return null;
  }

  const pathname = url.pathname;

  if (pathname.includes("/drive/folders/")) {
    return null;
  }

  const filePathMatch = pathname.match(/\/file\/d\/([^/]+)/);
  if (filePathMatch?.[1] && isValidDriveFileId(filePathMatch[1])) {
    return filePathMatch[1];
  }

  const queryId = url.searchParams.get("id");
  if (queryId && isValidDriveFileId(queryId)) {
    return queryId;
  }

  const thumbnailId = url.searchParams.get("fileId");
  if (thumbnailId && isValidDriveFileId(thumbnailId)) {
    return thumbnailId;
  }

  return null;
}

export function isGoogleDriveFolderUrl(value: string) {
  const input = clean(value);

  try {
    const url = new URL(input);
    return (
      url.hostname.endsWith("google.com") &&
      url.pathname.includes("/drive/folders/")
    );
  } catch {
    return false;
  }
}
