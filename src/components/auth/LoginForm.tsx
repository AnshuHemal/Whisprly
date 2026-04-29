"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  callbackUrl?: string;
  error?: string;
}

/** Maps NextAuth error codes to human-readable messages */
const AUTH_ERRORS: Record<string, string> = {
  OAuthSignin: "Could not start the sign-in flow. Please try again.",
  OAuthCallback: "Something went wrong during sign-in. Please try again.",
  OAuthCreateAccount: "Could not create your account. Please try again.",
  EmailCreateAccount: "Could not create your account. Please try again.",
  Callback: "Something went wrong. Please try again.",
  OAuthAccountNotLinked:
    "This email is already linked to a different sign-in method. Use the original method.",
  EmailSignin: "Could not send the magic link. Check your email address and try again.",
  CredentialsSignin: "Invalid credentials.",
  SessionRequired: "Please sign in to continue.",
  Default: "An unexpected error occurred. Please try again.",
};

/**
 * LoginForm — handles Google OAuth, GitHub OAuth, and magic link email sign-in.
 * Renders as a client component so it can manage loading states and call signIn().
 */
export function LoginForm({ callbackUrl, error }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const destination = callbackUrl ?? "/dashboard";
  const errorMessage = error ? (AUTH_ERRORS[error] ?? AUTH_ERRORS.Default) : null;

  /** Handle OAuth provider sign-in (Google / GitHub) */
  async function handleOAuthSignIn(provider: "google" | "github") {
    setLoadingProvider(provider);
    try {
      await signIn(provider, { redirectTo: destination });
    } catch {
      // signIn throws a redirect — this catch is intentional
    } finally {
      setLoadingProvider(null);
    }
  }

  /** Handle magic link email sign-in */
  async function handleEmailSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoadingProvider("email");
    try {
      const result = await signIn("resend", {
        email: email.trim(),
        redirect: false,
        callbackUrl: destination,
      });

      if (result?.ok) {
        setEmailSent(true);
      }
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {emailSent ? "Check your inbox" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {emailSent
              ? `We sent a magic link to ${email}`
              : "Sign in to start your interview session"}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      )}

      {emailSent ? (
        /* ── Magic link sent state ── */
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo/10">
            <svg
              className="h-7 w-7 text-indigo"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Click the link in the email to sign in. The link expires in 10 minutes.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEmailSent(false);
              setEmail("");
            }}
          >
            Use a different email
          </Button>
        </div>
      ) : (
        /* ── Sign-in form ── */
        <div className="flex flex-col gap-4">
          {/* OAuth buttons */}
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full gap-2.5 h-11"
              onClick={() => handleOAuthSignIn("google")}
              disabled={loadingProvider !== null}
              aria-label="Sign in with Google"
            >
              {loadingProvider === "google" ? (
                <Spinner />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2.5 h-11"
              onClick={() => handleOAuthSignIn("github")}
              disabled={loadingProvider !== null}
              aria-label="Sign in with GitHub"
            >
              {loadingProvider === "github" ? (
                <Spinner />
              ) : (
                <GitHubIcon />
              )}
              Continue with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground shrink-0">or continue with email</span>
            <Separator className="flex-1" />
          </div>

          {/* Magic link form */}
          <form onSubmit={handleEmailSignIn} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                disabled={loadingProvider !== null}
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className={cn(
                "w-full h-11 bg-indigo hover:bg-indigo-dark text-white font-medium",
                "transition-colors duration-150"
              )}
              disabled={loadingProvider !== null || !email.trim()}
            >
              {loadingProvider === "email" ? (
                <span className="flex items-center gap-2">
                  <Spinner className="text-white" />
                  Sending link…
                </span>
              ) : (
                "Send magic link"
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <a href="/terms" className="underline underline-offset-2 hover:text-foreground">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
