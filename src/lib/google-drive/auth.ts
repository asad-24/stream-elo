import { google } from "googleapis";
import {
  assertGoogleDriveConfigured,
  getGoogleDriveConfig,
  type GoogleDriveConfig,
} from "@/lib/google-drive/config";

const driveScopes = ["https://www.googleapis.com/auth/drive"];

type AccessTokenResult = string | { token?: string | null } | null | undefined;

export type GoogleDriveAuthClient = {
  getAccessToken(): Promise<AccessTokenResult>;
};

export function createGoogleDriveAuthClient(
  config: GoogleDriveConfig = getGoogleDriveConfig(),
): GoogleDriveAuthClient {
  const safeConfig = assertGoogleDriveConfigured(config);

  if (safeConfig.authMode === "oauth") {
    const client = new google.auth.OAuth2({
      clientId: safeConfig.clientId,
      clientSecret: safeConfig.clientSecret,
    });

    client.setCredentials({
      refresh_token: safeConfig.refreshToken,
    });

    return client;
  }

  if (safeConfig.authMode === "service-account") {
    return new google.auth.JWT({
      email: safeConfig.serviceAccountEmail,
      key: safeConfig.serviceAccountPrivateKey,
      scopes: driveScopes,
    });
  }

  throw new Error("Google Drive auth mode is invalid.");
}

export async function getGoogleDriveAccessToken(auth: GoogleDriveAuthClient) {
  const token = await auth.getAccessToken();
  const value = typeof token === "string" ? token : token?.token;

  if (!value) {
    throw new Error("Unable to obtain Google Drive access token.");
  }

  return value;
}
