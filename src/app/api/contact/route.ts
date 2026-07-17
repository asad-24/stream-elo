import { NextResponse } from "next/server";
import {
  contactInquirySchema,
  createContactInquiry,
} from "@/lib/server/contact-inquiries";

export const runtime = "nodejs";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const windowMs = 60 * 1000;
const maxRequests = 5;
const buckets = new Map<string, RateLimitEntry>();

function clientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  return forwardedFor.split(",")[0]?.trim() || "unknown";
}

function isLimited(key: string) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  return current.count > maxRequests;
}

export async function POST(request: Request) {
  try {
    if (isLimited(clientKey(request))) {
      return NextResponse.json(
        { ok: false, error: "Too many submissions. Please try again shortly." },
        { status: 429 },
      );
    }

    const body: unknown = await request.json();
    const parsed = contactInquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Please check the form fields and try again.",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    if (parsed.data.website) {
      return NextResponse.json({ ok: true, id: null });
    }

    const inquiry = await createContactInquiry(parsed.data);

    return NextResponse.json({ ok: true, inquiry }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("MONGODB_URI")
        ? "Database is not configured."
        : "Unable to submit inquiry right now.";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
