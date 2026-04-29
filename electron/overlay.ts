import { BrowserWindow, screen } from "electron";
import path from "path";

const DEV_URL = "http://localhost:3000";
const OVERLAY_WIDTH = 480;
const OVERLAY_HEIGHT = 520;
const MARGIN = 16;

/**
 * Creates the transparent, always-on-top session overlay window.
 *
 * Properties:
 *  - transparent: true — the window background is fully transparent
 *  - frame: false — no OS chrome (title bar, borders)
 *  - alwaysOnTop: true — floats above all other windows including video calls
 *  - skipTaskbar: true — doesn't appear in the taskbar / dock
 *  - hasShadow: false — no drop shadow (keeps it invisible)
 *
 * The overlay loads /session/[id] from the Next.js app and renders
 * the SessionOverlay component which is already dark-mode by default.
 */
export function createOverlayWindow(sessionId: string): BrowserWindow {
  const { width: screenW } = screen.getPrimaryDisplay().workAreaSize;

  // Default position: top-right corner
  const x = screenW - OVERLAY_WIDTH - MARGIN;
  const y = MARGIN;

  const overlay = new BrowserWindow({
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    x,
    y,
    // ── Invisibility properties ──────────────────────────────────────
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    // ── Behaviour ────────────────────────────────────────────────────
    resizable: true,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    // ── Security ─────────────────────────────────────────────────────
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      sandbox: true,
    },
    // ── Platform-specific ────────────────────────────────────────────
    // On macOS: float above full-screen apps (e.g. Zoom in full-screen mode)
    ...(process.platform === "darwin"
      ? { type: "panel" as const }
      : {}),
  });

  // Load the session page
  const url = `${DEV_URL}/session/${sessionId}`;
  overlay.loadURL(url);

  // On macOS, set the window level to float above screen-sharing captures
  if (process.platform === "darwin") {
    overlay.setAlwaysOnTop(true, "screen-saver");
  } else {
    overlay.setAlwaysOnTop(true, "pop-up-menu");
  }

  // Make the overlay visible on all virtual desktops / workspaces
  overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  return overlay;
}
