import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  adminRoleSchema,
  type AdminUser,
} from "@/lib/server/cms-models";
import { collections, getDb } from "@/lib/server/mongodb";

export const adminSessionCookieName = "meroe_admin_session";
const sessionMaxAgeSeconds = 60 * 60 * 8;

const sessionPayloadSchema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i),
  role: adminRoleSchema,
  exp: z.number().int().positive(),
});

export type AdminSession = z.infer<typeof sessionPayloadSchema>;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET || process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be configured with at least 32 characters.");
  }

  return secret;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function signaturesMatch(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function hashAdminPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyAdminPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function createAdminSessionToken(input: {
  userId: string;
  role: AdminSession["role"];
}) {
  const payload: AdminSession = {
    userId: input.userId,
    role: input.role,
    exp: Math.floor(Date.now() / 1000) + sessionMaxAgeSeconds,
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export function verifyAdminSessionToken(token: string | undefined) {
  if (!token) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature || !signaturesMatch(sign(encoded), signature)) {
    return null;
  }

  try {
    const payload = sessionPayloadSchema.parse(JSON.parse(base64UrlDecode(encoded)));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  };
}

export async function getAdminUserByEmail(email: string) {
  const db = await getDb();
  return db.collection<AdminUser>(collections.users).findOne({
    email: email.trim().toLowerCase(),
  });
}

export async function getCurrentAdminUser() {
  const token = (await cookies()).get(adminSessionCookieName)?.value;
  return getAdminUserFromToken(token);
}

export async function getAdminUserFromToken(token: string | undefined) {
  const session = verifyAdminSessionToken(token);

  if (!session) return null;

  const db = await getDb();
  const user = await db.collection<AdminUser>(collections.users).findOne({
    _id: new ObjectId(session.userId),
    isActive: true,
  });

  return user;
}

export async function getAdminUserFromRequest(request: NextRequest) {
  return getAdminUserFromToken(request.cookies.get(adminSessionCookieName)?.value);
}

export function canAccessAdminArea(
  role: AdminSession["role"],
  required: AdminSession["role"] = "editor",
) {
  const rank: Record<AdminSession["role"], number> = {
    editor: 1,
    admin: 2,
    "super-admin": 3,
  };

  return rank[role] >= rank[required];
}
