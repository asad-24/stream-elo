import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  adminSessionCookieName,
  adminSessionCookieOptions,
  createAdminSessionToken,
  getAdminUserByEmail,
  verifyAdminPassword,
} from "@/lib/server/admin-auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(300),
});

type LoginAttempt = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, LoginAttempt>();
const windowMs = 60 * 1000;
const maxAttempts = 8;

function clientKey(request: NextRequest, email: string) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwardedFor.split(",")[0]?.trim() || "unknown";
  return `${ip}:${email.toLowerCase()}`;
}

function isLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > maxAttempts;
}

function loginRedirect(request: NextRequest, error?: string) {
  const url = new URL("/admin/login", request.url);
  if (error) url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

function wantsJson(request: NextRequest) {
  return (
    request.headers.get("content-type")?.includes("application/json") ||
    request.headers.get("accept")?.includes("application/json")
  );
}

function errorMessage(error: string) {
  if (error === "limited") return "Too many attempts. Try again shortly.";
  if (error === "database-config") return "MongoDB env variables are missing.";
  if (error === "database-unavailable") return "MongoDB is not connecting right now.";
  if (error === "session-secret") return "SESSION_SECRET is missing in .env.local.";
  if (error === "invalid") return "Email or password is incorrect.";
  return "Admin login is unavailable right now.";
}

function loginFailure(request: NextRequest, error: string, status = 400) {
  if (wantsJson(request)) {
    return NextResponse.json(
      { ok: false, error, message: errorMessage(error) },
      { status },
    );
  }

  return loginRedirect(request, error);
}

function missingLoginSetup() {
  if (!process.env.MONGODB_URI || !process.env.MONGODB_DB) return "database-config";
  if (!(process.env.SESSION_SECRET || process.env.AUTH_SECRET)) return "session-secret";
  return null;
}

export async function POST(request: NextRequest) {
  const setupError = missingLoginSetup();
  if (setupError) {
    return loginFailure(request, setupError, 503);
  }

  const body = wantsJson(request)
    ? await request.json()
    : Object.fromEntries((await request.formData()).entries());
  const parsed = loginSchema.safeParse({
    email: body.email,
    password: body.password,
  });

  if (!parsed.success) {
    return loginFailure(request, "invalid", 400);
  }

  if (isLimited(clientKey(request, parsed.data.email))) {
    return loginFailure(request, "limited", 429);
  }

  try {
    const user = await getAdminUserByEmail(parsed.data.email);
    const passwordOk = user
      ? await verifyAdminPassword(parsed.data.password, user.passwordHash)
      : false;

    if (!user || !user.isActive || !passwordOk) {
      return loginFailure(request, "invalid", 401);
    }

    const response = wantsJson(request)
      ? NextResponse.json({ ok: true, redirectTo: "/admin/dashboard" })
      : NextResponse.redirect(new URL("/admin/dashboard", request.url), 303);
    response.cookies.set(
      adminSessionCookieName,
      createAdminSessionToken({
        userId: user._id.toString(),
        role: user.role,
      }),
      adminSessionCookieOptions(),
    );

    return response;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Mongo") ||
        error.message.includes("Topology") ||
        error.message.includes("SSL") ||
        error.message.includes("ECONN") ||
        error.message.includes("querySrv"))
    ) {
      return loginFailure(request, "database-unavailable", 503);
    }

    return loginFailure(request, "unavailable", 500);
  }
}
