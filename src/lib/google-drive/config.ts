export const defaultImportDriveFolders = {
  artefacts: "1YJcHwuAvvQNeZiT4cnVm_VyTaUSNn2P3",
  editedVideos: "1d2zIfC6a4uZNxJNOjQJOCleiN819n4Sx",
} as const;

export type GoogleDriveAuthMode = "oauth" | "service-account" | "missing";

export type GoogleDriveConfig = {
  authMode: GoogleDriveAuthMode;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  serviceAccountEmail?: string;
  serviceAccountPrivateKey?: string;
  sharedDriveId?: string;
  rootFolderId?: string;
  imagesFolderId?: string;
  videosFolderId?: string;
  downloadsFolderId?: string;
  originalsFolderId?: string;
};

function optionalEnv(key: string) {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

function privateKeyFromEnv(value: string | undefined) {
  return value?.replace(/\\n/g, "\n");
}

export function getGoogleDriveConfig(): GoogleDriveConfig {
  const clientId = optionalEnv("GOOGLE_CLIENT_ID");
  const clientSecret = optionalEnv("GOOGLE_CLIENT_SECRET");
  const refreshToken = optionalEnv("GOOGLE_REFRESH_TOKEN");
  const serviceAccountEmail = optionalEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const serviceAccountPrivateKey = privateKeyFromEnv(
    optionalEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"),
  );

  const hasOAuth = Boolean(clientId && clientSecret && refreshToken);
  const hasServiceAccount = Boolean(serviceAccountEmail && serviceAccountPrivateKey);

  return {
    authMode: hasOAuth ? "oauth" : hasServiceAccount ? "service-account" : "missing",
    clientId,
    clientSecret,
    refreshToken,
    serviceAccountEmail,
    serviceAccountPrivateKey,
    sharedDriveId: optionalEnv("GOOGLE_SHARED_DRIVE_ID"),
    rootFolderId: optionalEnv("GOOGLE_DRIVE_ROOT_FOLDER_ID"),
    imagesFolderId: optionalEnv("GOOGLE_DRIVE_IMAGES_FOLDER_ID"),
    videosFolderId: optionalEnv("GOOGLE_DRIVE_VIDEOS_FOLDER_ID"),
    downloadsFolderId: optionalEnv("GOOGLE_DRIVE_DOWNLOADS_FOLDER_ID"),
    originalsFolderId: optionalEnv("GOOGLE_DRIVE_ORIGINALS_FOLDER_ID"),
  };
}

export function assertGoogleDriveConfigured(config = getGoogleDriveConfig()) {
  if (config.authMode === "missing") {
    throw new Error(
      "Google Drive is not configured. Set OAuth refresh-token env vars or service-account env vars.",
    );
  }

  return config;
}
