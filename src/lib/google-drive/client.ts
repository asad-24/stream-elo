import { createGoogleDriveAuthClient } from "@/lib/google-drive/auth";

export function createGoogleDriveClient() {
  return {
    auth: createGoogleDriveAuthClient(),
    baseUrl: "https://www.googleapis.com/drive/v3",
    uploadBaseUrl: "https://www.googleapis.com/upload/drive/v3",
  };
}
