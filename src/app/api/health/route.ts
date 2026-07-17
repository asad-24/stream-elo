import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/mongodb";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });

    return NextResponse.json({
      ok: true,
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    const configured = Boolean(process.env.MONGODB_URI);

    return NextResponse.json(
      {
        ok: false,
        database: configured ? "unavailable" : "not_configured",
        error: configured ? "MongoDB ping failed." : "MONGODB_URI is missing.",
      },
      { status: configured ? 503 : 500 },
    );
  }
}
