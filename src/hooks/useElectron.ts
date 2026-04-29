"use client";

import { useEffect, useState } from "react";

interface ElectronAPI {
  isElectron: true;
  launchOverlay: (sessionId: string) => Promise<{ success: boolean }>;
  closeOverlay: () => Promise<{ success: boolean }>;
  setOpacity: (value: number) => Promise<{ success: boolean }>;
  snapToCorner: (
    corner: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  ) => Promise<{ success: boolean }>;
}

/**
 * useElectron — returns the Whisprly Electron IPC bridge if running inside
 * the desktop app, or null when running in a regular browser.
 *
 * Usage:
 *   const electron = useElectron();
 *   if (electron) {
 *     await electron.launchOverlay(sessionId);
 *   }
 */
export function useElectron(): ElectronAPI | null {
  const [api, setApi] = useState<ElectronAPI | null>(null);

  useEffect(() => {
    // window.whisprly is injected by the Electron preload script
    if (typeof window !== "undefined" && window.whisprly?.isElectron) {
      setApi(window.whisprly as ElectronAPI);
    }
  }, []);

  return api;
}
