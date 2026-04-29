import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Show just the icon, or icon + wordmark */
  variant?: "full" | "icon";
  /** Link destination — defaults to "/" */
  href?: string;
}

/**
 * Whisprly logo — icon mark + wordmark.
 * The icon is a stylised sound-wave / microphone glyph built from SVG.
 */
export function Logo({ className, variant = "full", href = "/" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 group focus:outline-none", className)}
      aria-label="Whisprly home"
    >
      {/* Icon mark */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-indigo text-white shadow-sm group-hover:shadow-indigo/40 group-hover:shadow-md transition-shadow duration-200">
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Microphone body */}
          <rect x="6.5" y="1" width="5" height="8" rx="2.5" fill="white" />
          {/* Microphone stand */}
          <path
            d="M3.5 8.5C3.5 11.538 6.462 14 9 14C11.538 14 14.5 11.538 14.5 8.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line x1="9" y1="14" x2="9" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="6.5" y1="17" x2="11.5" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Wordmark */}
      {variant === "full" && (
        <span className="font-semibold text-lg tracking-tight text-foreground">
          Whisprly
          <span className="text-indigo">.ai</span>
        </span>
      )}
    </Link>
  );
}
