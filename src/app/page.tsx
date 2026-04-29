import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: "Whisprly.ai — Hear the question. Nail the answer.",
  description:
    "The invisible AI copilot for your most important interviews. Real-time transcription and resume-aware answers, powered by GPT-4o.",
  openGraph: {
    title: "Whisprly.ai — Hear the question. Nail the answer.",
    description:
      "The invisible AI copilot for your most important interviews.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Whisprly.ai",
    description: "Hear the question. Nail the answer.",
  },
};

/**
 * Landing page — public, statically rendered.
 * Sections: Hero → Features → How it works → Footer
 */
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      <Hero />
      <Features />
      <HowItWorks />
      <LandingFooter />
    </div>
  );
}
