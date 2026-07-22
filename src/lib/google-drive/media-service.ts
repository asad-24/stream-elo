import { createGoogleDriveClient } from "@/lib/google-drive/client";
import {
  createGoogleDriveAuthClient,
  getGoogleDriveAccessToken,
} from "@/lib/google-drive/auth";
import { getGoogleDriveConfig } from "@/lib/google-drive/config";

const metadataFields = [
  "id",
  "name",
  "mimeType",
  "size",
  "createdTime",
  "modifiedTime",
  "parents",
  "md5Checksum",
  "thumbnailLink",
  "videoMediaMetadata",
].join(",");

type DriveListResponse = {
  files?: Array<Record<string, unknown>>;
};

export type DriveMediaMetadata = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  parents?: string[];
  md5Checksum?: string;
  thumbnailLink?: string;
  videoMediaMetadata?: unknown;
};

export type ResumableUploadInput = {
  name: string;
  mimeType: string;
  folderId?: string;
  size?: number;
};

function normalizeMetadata(file: Record<string, unknown>): DriveMediaMetadata {
  return {
    id: String(file.id ?? ""),
    name: String(file.name ?? ""),
    mimeType: String(file.mimeType ?? ""),
    size: file.size === undefined ? undefined : String(file.size),
    createdTime:
      file.createdTime === undefined ? undefined : String(file.createdTime),
    modifiedTime:
      file.modifiedTime === undefined ? undefined : String(file.modifiedTime),
    parents: Array.isArray(file.parents) ? file.parents.map(String) : undefined,
    md5Checksum:
      file.md5Checksum === undefined ? undefined : String(file.md5Checksum),
    thumbnailLink:
      file.thumbnailLink === undefined ? undefined : String(file.thumbnailLink),
    videoMediaMetadata: file.videoMediaMetadata,
  };
}

export async function listFolderFiles(folderId: string) {
  const client = createGoogleDriveClient();
  const accessToken = await getGoogleDriveAccessToken(client.auth);
  const params = new URLSearchParams({
    q: `'${folderId.replace(/'/g, "\\'")}' in parents and trashed = false`,
    fields: `files(${metadataFields})`,
    includeItemsFromAllDrives: "true",
    supportsAllDrives: "true",
  });

  const response = await fetch(`${client.baseUrl}/files?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Unable to list Drive folder files: ${response.status}`);
  }

  const result = (await response.json()) as DriveListResponse;
  const files = result.files ?? [];

  return files.map((file) =>
    normalizeMetadata(file as Record<string, unknown>),
  );
}

export async function getFileMetadata(fileId: string) {
  const client = createGoogleDriveClient();
  const accessToken = await getGoogleDriveAccessToken(client.auth);
  const params = new URLSearchParams({
    fields: metadataFields,
    supportsAllDrives: "true",
  });
  const response = await fetch(`${client.baseUrl}/files/${fileId}?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Unable to read Drive file metadata: ${response.status}`);
  }

  return normalizeMetadata((await response.json()) as Record<string, unknown>);
}

export async function downloadFile(fileId: string, range?: string) {
  const client = createGoogleDriveClient();
  const accessToken = await getGoogleDriveAccessToken(client.auth);
  const params = new URLSearchParams({
    alt: "media",
    supportsAllDrives: "true",
  });

  return fetch(`${client.baseUrl}/files/${fileId}?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(range ? { Range: range } : undefined),
    },
  });
}

export async function createResumableUploadSession(input: ResumableUploadInput) {
  const config = getGoogleDriveConfig();
  const auth = createGoogleDriveAuthClient(config);
  const accessToken = await getGoogleDriveAccessToken(auth);
  const folderId = input.folderId ?? config.videosFolderId ?? config.rootFolderId;

  const response = await fetch(
    `${createGoogleDriveClient().uploadBaseUrl}/files?uploadType=resumable&fields=id,name,mimeType,size,createdTime,modifiedTime,parents,md5Checksum,thumbnailLink,videoMediaMetadata`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": input.mimeType,
        ...(input.size
          ? { "X-Upload-Content-Length": String(input.size) }
          : undefined),
      },
      body: JSON.stringify({
        name: input.name,
        mimeType: input.mimeType,
        ...(folderId ? { parents: [folderId] } : undefined),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to create Drive upload session: ${response.status}`);
  }

  const uploadUrl = response.headers.get("location");
  if (!uploadUrl) {
    throw new Error("Drive did not return a resumable upload URL.");
  }

  return { uploadUrl };
}

export async function deleteFile(fileId: string) {
  const client = createGoogleDriveClient();
  const accessToken = await getGoogleDriveAccessToken(client.auth);
  const params = new URLSearchParams({ supportsAllDrives: "true" });
  const response = await fetch(`${client.baseUrl}/files/${fileId}?${params}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Unable to delete Drive file: ${response.status}`);
  }
}

export async function moveFile(fileId: string, folderId: string) {
  const metadata = await getFileMetadata(fileId);
  const client = createGoogleDriveClient();
  const accessToken = await getGoogleDriveAccessToken(client.auth);
  const previousParents = metadata.parents?.join(",");
  const params = new URLSearchParams({
    addParents: folderId,
    fields: metadataFields,
    supportsAllDrives: "true",
  });

  if (previousParents) {
    params.set("removeParents", previousParents);
  }

  const response = await fetch(`${client.baseUrl}/files/${fileId}?${params}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Unable to move Drive file: ${response.status}`);
  }

  return normalizeMetadata((await response.json()) as Record<string, unknown>);
}

export async function renameFile(fileId: string, name: string) {
  const client = createGoogleDriveClient();
  const accessToken = await getGoogleDriveAccessToken(client.auth);
  const params = new URLSearchParams({
    fields: metadataFields,
    supportsAllDrives: "true",
  });
  const response = await fetch(`${client.baseUrl}/files/${fileId}?${params}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw new Error(`Unable to rename Drive file: ${response.status}`);
  }

  return normalizeMetadata((await response.json()) as Record<string, unknown>);
}
