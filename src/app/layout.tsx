import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Whisprly.ai — Hear the question. Nail the answer.",
  description:
    "The invisible AI copilot for your most important interviews. Real-time transcription and resume-aware answers, powered by GPT-4o.",
  keywords: ["interview", "AI", "copilot", "job interview", "whisprly"],
  authors: [{ name: "Whisprly" }],
  openGraph: {
    title: "Whisprly.ai",
    description: "Hear the question. Nail the answer.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <SessionProvider>
          <TooltipProvider delay={300}>
            {children}
          </TooltipProvider>
        </SessionProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "font-sans",
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}
