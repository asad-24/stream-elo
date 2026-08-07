import { type NextRequest } from "next/server";
import { GET as list, POST as create } from "@/app/api/admin/content/[resource]/route";
const context = { params: Promise.resolve({ resource: "projects" }) };
export function GET(request: NextRequest) { return list(request, context); }
export function POST(request: NextRequest) { return create(request, context); }
