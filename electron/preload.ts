import { contextBridge, ipcRenderer } from "electron";

/**
 * Whisprly IPC bridge — exposed to the renderer (Next.js app) via contextBridge.
 *
 * Security model:
 *  - contextIsolation: true — renderer cannot access Node.js APIs directly
 *  - Only explicitly whitelisted channels are exposed
 *  - All values are validated before being passed to ipcRenderer
 *
 * Usage in the renderer:
 *   window.whisprly.launchOverlay("session-id-here")
 *   window.whisprly.setOpacity(0.85)
 *   window.whisprly.snapToCorner("top-right")
 */
contextBridge.exposeInMainWorld("whisprly", {
  /**
   * Launches the transparent overlay for the given session ID.
   */
  launchOverlay: (sessionId: string): Promise<{ success: boolean }> => {
    if (typeof sessionId !== "string" || !sessionId.trim()) {
      return Promise.reject(new Error("Invalid sessionId"));
    }
    return ipcRenderer.invoke("overlay:launch", sessionId);
  },

  /**
   * Closes the overlay window.
   */
  closeOverlay: (): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke("overlay:close");
  },

  /**
   * Sets the overlay window opacity (0.1 – 1.0).
   */
  setOpacity: (value: number): Promise<{ success: boolean }> => {
    if (typeof value !== "number" || value < 0 || value > 1) {
      return Promise.reject(new Error("Opacity must be between 0 and 1"));
    }
    return ipcRenderer.invoke("overlay:setOpacity", value);
  },

  /**
   * Snaps the overlay to a screen corner.
   */
  snapToCorner: (
    corner: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  ): Promise<{ success: boolean }> => {
    const valid = ["top-right", "top-left", "bottom-right", "bottom-left"];
    if (!valid.includes(corner)) {
      return Promise.reject(new Error("Invalid corner"));
    }
    return ipcRenderer.invoke("overlay:snapToCorner", corner);
  },

  /**
   * Returns true when running inside Electron (vs. a regular browser).
   * Use this to conditionally show the overlay launch button.
   */
  isElectron: true as const,
});
