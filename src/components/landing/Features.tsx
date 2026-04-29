import {
  Mic,
  FileText,
  EyeOff,
  Zap,
  Shield,
  Cpu,
} from "lucide-react";

const FEATURES = [
  {
    icon: Mic,
    title: "Real-time transcription",
    description:
      "Listens continuously using the Web Speech API with a 2-second silence detector. Questions are captured the moment you stop speaking.",
    accent: "bg-indigo/10 text-indigo",
  },
  {
    icon: FileText,
    title: "Resume-aware answers",
    description:
      "Upload your PDF once. Every answer pulls specific examples from your experience — no generic responses, ever.",
    accent: "bg-violet-500/10 text-violet-500",
  },
  {
    icon: EyeOff,
    title: "100% invisible",
    description:
      "The overlay is transparent and always-on-top. Screen sharing software sees nothing. Proctoring tools detect nothing.",
    accent: "bg-sky-500/10 text-sky-500",
  },
  {
    icon: Zap,
    title: "Streams in under a second",
    description:
      "GPT-4o and Claude Sonnet stream tokens as fast as they generate them. You see the answer building in real time.",
    accent: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: Shield,
    title: "End-to-end encrypted",
    description:
      "All transcripts are encrypted with AES-GCM 256-bit before hitting the database. Auto-deleted after 30 days.",
    accent: "bg-green-500/10 text-green-500",
  },
  {
    icon: Cpu,
    title: "Two models, one toggle",
    description:
      "Switch between GPT-4o and Claude Sonnet mid-session. Pick the model that fits the question — technical or behavioural.",
    accent: "bg-rose-500/10 text-rose-500",
  },
];

/**
 * Features — six-card grid showcasing Whisprly's core capabilities.
 */
export function Features() {
  return (
    <section
      id="features"
      className="py-24 px-4 sm:px-6 border-t border-border/50"
      aria-labelledby="features-heading"
    >
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo mb-3">
            Features
          </p>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground"
          >
            Everything you need to ace the interview
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Built for real interviews — not demos. Every feature is designed to
            work silently in the background while you focus on the conversation.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description, accent }) => (
            <div
              key={title}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-indigo/30 hover:shadow-lg hover:shadow-indigo/5 hover:-translate-y-0.5"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Platform logos */}
        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground/60 mb-6 uppercase tracking-widest">
            Works on every platform
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {["Zoom", "Google Meet", "Microsoft Teams", "Webex", "Discord"].map(
              (platform) => (
                <span
                  key={platform}
                  className="text-sm font-medium text-muted-foreground/50"
                >
                  {platform}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
