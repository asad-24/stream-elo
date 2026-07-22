import {
  createResumableUploadSession,
  deleteFile,
  downloadFile,
  getFileMetadata,
} from "@/lib/google-drive/media-service";
import {
  type MediaStorageProvider,
  type UploadInput,
} from "@/lib/media/storage-provider";

export class GoogleDriveStorageProvider implements MediaStorageProvider {
  createUpload(input: UploadInput) {
    return createResumableUploadSession(input);
  }

  getMetadata(fileId: string) {
    return getFileMetadata(fileId);
  }

  getStream(fileId: string, range?: string) {
    return downloadFile(fileId, range);
  }

  getDownload(fileId: string) {
    return downloadFile(fileId);
  }

  delete(fileId: string) {
    return deleteFile(fileId);
  }
}
