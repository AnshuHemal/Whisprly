/**
 * Auth route group layout.
 * Keeps auth pages isolated from the main app shell (no nav, no sidebar).
 * The root layout's SessionProvider is still active here.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
