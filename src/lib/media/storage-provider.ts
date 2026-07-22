export type UploadInput = {
  name: string;
  mimeType: string;
  size?: number;
  folderId?: string;
};

export type UploadSession = {
  uploadUrl: string;
};

export type MediaMetadata = {
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

export type MediaStreamResponse = Response;

export interface MediaStorageProvider {
  createUpload(input: UploadInput): Promise<UploadSession>;
  getMetadata(fileId: string): Promise<MediaMetadata>;
  getStream(fileId: string, range?: string): Promise<MediaStreamResponse>;
  getDownload(fileId: string): Promise<MediaStreamResponse>;
  delete(fileId: string): Promise<void>;
}
