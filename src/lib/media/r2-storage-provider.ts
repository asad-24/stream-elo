import "server-only";

import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
  type CompletedPart,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { slugify } from "@/lib/server/media-validation";

const minimumPartSize = 5 * 1024 * 1024;
const singlePartUploadMax = 100 * 1024 * 1024;

export type R2MediaType = "image" | "video";

export type R2UploadPart = {
  partNumber: number;
  uploadUrl: string;
  start: number;
  end: number;
};

export type R2UploadSession =
  | {
      mode: "single";
      key: string;
      bucket: string;
      publicUrl: string;
      uploadUrl: string;
    }
  | {
      mode: "multipart";
      key: string;
      bucket: string;
      publicUrl: string;
      uploadId: string;
      partSize: number;
      parts: R2UploadPart[];
    };

export type R2CompletePartInput = {
  partNumber: number;
  etag: string;
};

export function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucketName = process.env.R2_BUCKET_NAME?.trim();
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  const objectPrefix = (process.env.R2_OBJECT_PREFIX ?? (process.env.NODE_ENV === "production" ? "production" : "dev"))
    .trim()
    .replace(/^\/+|\/+$/g, "");
  const rawPartSizeMb = Number(process.env.R2_UPLOAD_PART_SIZE_MB ?? 64);
  const uploadPartSize = Math.max(
    minimumPartSize,
    Math.floor(Number.isFinite(rawPartSizeMb) ? rawPartSizeMb : 64) * 1024 * 1024,
  );

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicBaseUrl,
    objectPrefix,
    uploadPartSize,
    endpoint: accountId
      ? `https://${accountId}.r2.cloudflarestorage.com`
      : undefined,
    isConfigured: Boolean(
      accountId && accessKeyId && secretAccessKey && bucketName && publicBaseUrl,
    ),
  };
}

export function requireR2Config() {
  const config = getR2Config();
  if (!config.isConfigured) {
    throw new Error("Cloudflare R2 is not configured.");
  }

  return config as ReturnType<typeof getR2Config> & {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicBaseUrl: string;
    endpoint: string;
  };
}

let r2ClockOffsetPromise: Promise<number> | undefined;

async function getR2ClockOffset(endpoint: string) {
  if (!r2ClockOffsetPromise) {
    r2ClockOffsetPromise = fetch(endpoint, { method: "HEAD", cache: "no-store" })
      .then((response) => {
        const serverDate = response.headers.get("date");
        if (!serverDate) return 0;
        const offset = new Date(serverDate).getTime() - Date.now();
        return Number.isFinite(offset) ? offset : 0;
      })
      .catch(() => 0);
  }
  return r2ClockOffsetPromise;
}

async function createR2Client() {
  const config = requireR2Config();
  const systemClockOffset = await getR2ClockOffset(config.endpoint);
  return new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    systemClockOffset,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function extensionForFilename(name: string) {
  const match = name.toLowerCase().match(/\.([a-z0-9]{1,12})$/);
  return match ? `.${match[1]}` : "";
}

export function createR2ObjectKey(input: {
  name: string;
  mediaType: R2MediaType;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const safeBase = slugify(input.name.replace(/\.[^.]+$/, "")) || "media";
  const ext = extensionForFilename(input.name);
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const token =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const prefix = getR2Config().objectPrefix;
  return `${prefix ? `${prefix}/` : ""}${input.mediaType}s/${yyyy}/${mm}/${safeBase}-${token}${ext}`;
}

export function getR2PublicUrl(key: string) {
  const config = requireR2Config();
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${config.publicBaseUrl}/${encodedKey}`;
}

function createParts(size: number, partSize: number) {
  const partCount = Math.ceil(size / partSize);
  return Array.from({ length: partCount }, (_, index): Omit<R2UploadPart, "uploadUrl"> => {
    const start = index * partSize;
    return {
      partNumber: index + 1,
      start,
      end: Math.min(size, start + partSize),
    };
  });
}

export async function createR2UploadSession(input: {
  name: string;
  mimeType: string;
  size: number;
  mediaType: R2MediaType;
}) {
  const config = requireR2Config();
  const client = await createR2Client();
  const signingDate = new Date(Date.now() + await getR2ClockOffset(config.endpoint));
  const key = createR2ObjectKey({ name: input.name, mediaType: input.mediaType });
  const publicUrl = getR2PublicUrl(key);

  if (input.mediaType === "image" || input.size <= singlePartUploadMax) {
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: key,
        ContentType: input.mimeType,
        CacheControl: "public, max-age=31536000, immutable",
        Metadata: { originalName: input.name },
      }),
      { expiresIn: 60 * 15, signingDate },
    );

    return {
      mode: "single",
      key,
      bucket: config.bucketName,
      publicUrl,
      uploadUrl,
    } satisfies R2UploadSession;
  }

  const createResult = await client.send(
    new CreateMultipartUploadCommand({
      Bucket: config.bucketName,
      Key: key,
      ContentType: input.mimeType,
      CacheControl: "public, max-age=31536000, immutable",
      Metadata: { originalName: input.name },
    }),
  );

  if (!createResult.UploadId) {
    throw new Error("R2 did not return a multipart upload ID.");
  }

  const parts = await Promise.all(
    createParts(input.size, config.uploadPartSize).map(async (part) => ({
      ...part,
      uploadUrl: await getSignedUrl(
        client,
        new UploadPartCommand({
          Bucket: config.bucketName,
          Key: key,
          UploadId: createResult.UploadId,
          PartNumber: part.partNumber,
        }),
        { expiresIn: 60 * 60, signingDate },
      ),
    })),
  );

  return {
    mode: "multipart",
    key,
    bucket: config.bucketName,
    publicUrl,
    uploadId: createResult.UploadId,
    partSize: config.uploadPartSize,
    parts,
  } satisfies R2UploadSession;
}

export async function headR2Object(key: string) {
  const config = requireR2Config();
  const client = await createR2Client();
  return client.send(new HeadObjectCommand({ Bucket: config.bucketName, Key: key }));
}

export async function completeR2MultipartUpload(input: {
  key: string;
  uploadId: string;
  parts: R2CompletePartInput[];
}) {
  const config = requireR2Config();
  const client = await createR2Client();
  const completedParts: CompletedPart[] = input.parts
    .map((part) => ({
      PartNumber: part.partNumber,
      ETag: part.etag,
    }))
    .sort((a, b) => Number(a.PartNumber) - Number(b.PartNumber));

  return client.send(
    new CompleteMultipartUploadCommand({
      Bucket: config.bucketName,
      Key: input.key,
      UploadId: input.uploadId,
      MultipartUpload: { Parts: completedParts },
    }),
  );
}

export async function abortR2MultipartUpload(input: {
  key: string;
  uploadId: string;
}) {
  const config = requireR2Config();
  const client = await createR2Client();

  await client.send(
    new AbortMultipartUploadCommand({
      Bucket: config.bucketName,
      Key: input.key,
      UploadId: input.uploadId,
    }),
  );
}

export async function deleteR2Object(key: string) {
  const config = requireR2Config();
  const client = await createR2Client();
  await client.send(new DeleteObjectCommand({ Bucket: config.bucketName, Key: key }));
}

export async function getR2Object(key: string, range?: string) {
  const config = requireR2Config();
  const client = await createR2Client();
  return client.send(
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      ...(range ? { Range: range } : undefined),
    }),
  );
}
