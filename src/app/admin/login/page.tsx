import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Login",
};

function messageFor(error: string | undefined) {
  return error;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const message = messageFor(params.error);

  return (
    <main className="min-h-screen bg-obsidian px-4 py-24 text-papyrus">
      <div className="mx-auto max-w-md border border-papyrus/10 bg-papyrus/[0.035] p-7">
        <p className="label">Meroe Stream</p>
        <h1 className="mt-4 font-serif text-4xl text-papyrus">Admin login</h1>
        <LoginForm initialError={message} />
      </div>
    </main>
  );
}
