import { type NextRequest } from "next/server";
import { POST as publish } from "@/app/api/admin/content/[resource]/[id]/publish/route";
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return publish(request, { params: Promise.resolve({ resource: "projects", id: (await context.params).id }) });
}
