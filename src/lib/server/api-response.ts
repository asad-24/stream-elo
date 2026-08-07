import { NextResponse } from "next/server";

export function apiData(data: unknown, init?: ResponseInit & { pagination?: unknown }) {
  return NextResponse.json({ ok: true, data, error: null, issues: null, pagination: init?.pagination ?? null }, init);
}

export function apiError(error: string, status = 400, issues: unknown = null) {
  return NextResponse.json({ ok: false, data: null, error, issues, pagination: null }, { status });
}
