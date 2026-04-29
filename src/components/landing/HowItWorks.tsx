import Link from "next/link";
import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Upload your resume",
    description:
      "Drop your PDF once. Whisprly parses it and uses your experience as context for every answer — no re-uploading between sessions.",
  },
  {
    number: "02",
    title: "Start a session",
    description:
      "Create a session with the job title and company. Paste the job description for even more targeted answers.",
  },
  {
    number: "03",
    title: "Press Space, start talking",
    description:
      "The mic activates. Whisprly listens for the question, detects when you stop speaking, and starts generating an answer instantly.",
  },
  {
    number: "04",
    title: "Read the answer, speak naturally",
    description:
      "The answer streams in real time. Copy it, adapt it, or read it directly. Your interviewer sees nothing — just you.",
  },
];

/**
 * HowItWorks — numbered step-by-step walkthrough with a final CTA.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 px-4 sm:px-6 border-t border-border/50 bg-muted/20"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo mb-3">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground"
          >
            From setup to answer in 60 seconds
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {STEPS.map(({ number, title, description }) => (
            <div key={number} className="flex gap-5">
              {/* Number */}
              <div className="shrink-0 mt-0.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo/10 text-indigo text-sm font-bold font-mono"
                  aria-hidden="true"
                >
                  {number}
                </span>
              </div>
              {/* Content */}
              <div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-semibold text-foreground">
            Ready to nail your next interview?
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-indigo hover:bg-indigo-dark text-white font-medium px-8 py-3.5 rounded-xl text-sm transition-all duration-150 shadow-lg shadow-indigo/25 hover:shadow-indigo/40 hover:-translate-y-0.5"
          >
            Get started — it&apos;s free
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="text-xs text-muted-foreground/60">
            No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
