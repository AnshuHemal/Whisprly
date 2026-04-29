/**
 * Type declarations for the Whisprly Electron IPC bridge.
 * Exposed via contextBridge in electron/preload.ts.
 *
 * These types are available in the renderer (Next.js app) when running
 * inside Electron. Always guard with `window.whisprly?.isElectron` before use.
 */

interface WhisprlyBridge {
  /** True when running inside the Electron shell */
  isElectron: true;

  /** Launches the transparent overlay for the given session ID */
  launchOverlay: (sessionId: string) => Promise<{ success: boolean }>;

  /** Closes the overlay window */
  closeOverlay: () => Promise<{ success: boolean }>;

  /** Sets the overlay window opacity (0.1 – 1.0) */
  setOpacity: (value: number) => Promise<{ success: boolean }>;

  /** Snaps the overlay to a screen corner */
  snapToCorner: (
    corner: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  ) => Promise<{ success: boolean }>;
}

declare global {
  interface Window {
    /** Available only when running inside the Whisprly Electron app */
    whisprly?: WhisprlyBridge;
  }
}

export {};
