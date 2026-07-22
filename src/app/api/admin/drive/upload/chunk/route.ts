import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/server/admin-auth";

export const runtime = "nodejs";

export async function PUT(request: NextRequest) {
  const user = await getAdminUserFromRequest(request);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(
    {
      ok: false,
      error:
        "Chunk proxy is not enabled. Use the resumable uploadUrl returned by initiate after browser CORS is verified.",
    },
    { status: 501 },
  );
}
