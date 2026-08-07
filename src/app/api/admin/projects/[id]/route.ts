import { type NextRequest } from "next/server";
import { DELETE as remove, GET as read, PATCH as update } from "@/app/api/admin/content/[resource]/[id]/route";
type Context = { params: Promise<{ id: string }> };
async function mapped(context: Context) { return { params: Promise.resolve({ resource: "projects", id: (await context.params).id }) }; }
export async function GET(request: NextRequest, context: Context) { return read(request, await mapped(context)); }
export async function PATCH(request: NextRequest, context: Context) { return update(request, await mapped(context)); }
export async function DELETE(request: NextRequest, context: Context) { return remove(request, await mapped(context)); }
