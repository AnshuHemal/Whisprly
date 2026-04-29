import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ArrowRight } from "lucide-react";

/**
 * Hero — above-the-fold section.
 *
 * Layout:
 *  - Sticky nav (logo + sign in)
 *  - Headline + subheading + CTA
 *  - Animated mockup of the session overlay
 */
export function Hero() {
  return (
    <section className="relative flex flex-col min-h-screen">
      {/* ── Background gradients ──────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Top indigo glow */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, #4f46e5 0%, transparent 70%)",
          }}
        />
        {/* Bottom subtle glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-10"
          style={{
            background:
              "radial-gradient(ellipse at center, #6366f1 0%, transparent 70%)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="https://github.com/whisprly"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-accent"
              aria-label="View on GitHub"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </Link>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-accent"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-medium bg-indigo hover:bg-indigo-dark text-white px-4 py-1.5 rounded-lg transition-colors"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-16 pb-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo/30 bg-indigo/5 px-4 py-1.5 text-xs font-medium text-indigo mb-8">
          <span
            className="h-1.5 w-1.5 rounded-full bg-indigo animate-pulse"
            aria-hidden="true"
          />
          Powered by GPT-4o &amp; Claude Sonnet
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground max-w-4xl leading-[1.1]">
          Hear the question.{" "}
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
            }}
          >
            Nail the answer.
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          The invisible AI copilot for your most important interviews. Real-time
          transcription and resume-aware answers — without being detected.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2 bg-indigo hover:bg-indigo-dark text-white font-medium px-6 py-3 rounded-xl text-sm transition-all duration-150 shadow-lg shadow-indigo/25 hover:shadow-indigo/40 hover:-translate-y-0.5"
          >
            Get started — it&apos;s free
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="#how-it-works"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-6 py-3 rounded-xl border border-border hover:border-indigo/30 hover:bg-accent/50"
          >
            See how it works
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-xs text-muted-foreground/60">
          Works with Zoom, Google Meet, Microsoft Teams, and more
        </p>

        {/* ── Mockup ─────────────────────────────────────────────────── */}
        <div className="mt-16 w-full max-w-2xl mx-auto">
          <SessionMockup />
        </div>
      </div>
    </section>
  );
}

// ─── Session overlay mockup ───────────────────────────────────────────────

function SessionMockup() {
  return (
    <div
      className="relative rounded-2xl border border-white/10 bg-[#0f0f1a] shadow-2xl shadow-indigo/10 overflow-hidden text-left"
      role="img"
      aria-label="Preview of the Whisprly session overlay"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo">
            <svg width="12" height="12" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="6.5" y="1" width="5" height="8" rx="2.5" fill="white" />
              <path d="M3.5 8.5C3.5 11.538 6.462 14 9 14C11.538 14 14.5 11.538 14.5 8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="9" y1="14" x2="9" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-white">Senior Engineer Interview</p>
            <p className="text-[10px] text-white/40">Acme Corp</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-white/40">04:32</span>
          <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded">GPT-4o</span>
          <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">End</span>
        </div>
      </div>

      {/* Status */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-1.5 text-xs text-indigo-light">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo animate-pulse" aria-hidden="true" />
          Listening…
        </div>
      </div>

      {/* Question */}
      <div className="px-4 py-2">
        <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1">Question</p>
        <p className="text-xs text-white/60 font-mono leading-relaxed">
          Tell me about a time you had to scale a system under pressure.
        </p>
      </div>

      {/* Answer */}
      <div className="px-4 pb-4">
        <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider mb-2">Answer</p>
        <p className="text-sm text-white/90 leading-relaxed">
          At Acme Corp, our WebSocket service started dropping connections 2 hours before a major product launch — serving 500k concurrent users. I quickly identified a connection leak in our cleanup logic, deployed a targeted hotfix, and we launched on time.
          <span className="inline-block w-0.5 h-4 bg-indigo ml-0.5 animate-pulse align-middle" aria-hidden="true" />
        </p>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/8">
        <span className="text-xs text-white/20">Press Space to listen</span>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo shadow-lg shadow-indigo/40">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="2" width="6" height="11" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          </div>
        </div>
      </div>

      {/* Gradient fade at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
        style={{
          background: "linear-gradient(to top, #0f0f1a, transparent)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
