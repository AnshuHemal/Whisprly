import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Create account — Whisprly.ai",
  description: "Create your free Whisprly account and start acing your interviews.",
};

interface SignupPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

/**
 * Signup page — NextAuth handles account creation automatically on first sign-in,
 * so this page renders the same LoginForm with a slightly different heading context.
 * The `LoginForm` component is reused as-is.
 */
export default async function SignupPage({ searchParams }: SignupPageProps) {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const { callbackUrl, error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Subtle background gradient */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,70,229,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-sm">
        <LoginForm callbackUrl={callbackUrl} error={error} />
      </div>
    </main>
  );
}
