import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  screen,
  shell,
} from "electron";
import path from "path";
import { createOverlayWindow } from "./overlay";

// ─── Constants ────────────────────────────────────────────────────────────

const DEV_URL = "http://localhost:3000";
const PROD_URL = "http://localhost:3000"; // In production, Next.js is served separately

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;

// ─── App lifecycle ────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  createMainWindow();
  registerGlobalShortcuts();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

// ─── Main window ──────────────────────────────────────────────────────────

/**
 * Creates the main Whisprly browser window.
 * This is the standard app window used for the dashboard and auth flows.
 */
function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "Whisprly.ai",
    backgroundColor: "#0f0f1a",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      sandbox: true,
    },
    // macOS traffic lights
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    show: false,
  });

  const url = app.isPackaged ? PROD_URL : DEV_URL;
  mainWindow.loadURL(url);

  // Show window once ready to avoid white flash
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  // Open external links in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (targetUrl.startsWith("http")) {
      shell.openExternal(targetUrl);
    }
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    // Close overlay when main window closes
    overlayWindow?.close();
    overlayWindow = null;
  });
}

// ─── Overlay window ───────────────────────────────────────────────────────

/**
 * Launches the transparent always-on-top session overlay.
 * Called via IPC from the renderer when a session starts.
 */
function launchOverlay(sessionId: string): void {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.focus();
    return;
  }

  overlayWindow = createOverlayWindow(sessionId);

  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });
}

// ─── Global keyboard shortcuts ────────────────────────────────────────────

function registerGlobalShortcuts(): void {
  // CommandOrControl+Shift+W — toggle overlay visibility
  const toggleRegistered = globalShortcut.register(
    "CommandOrControl+Shift+W",
    () => {
      if (!overlayWindow || overlayWindow.isDestroyed()) return;

      if (overlayWindow.isVisible()) {
        overlayWindow.hide();
      } else {
        overlayWindow.show();
        overlayWindow.focus();
      }
    }
  );

  if (!toggleRegistered) {
    console.warn("[Whisprly] Failed to register global shortcut Ctrl+Shift+W");
  }
}

// ─── IPC handlers ─────────────────────────────────────────────────────────

/**
 * Renderer → Main: launch the overlay for a given session ID.
 */
ipcMain.handle("overlay:launch", (_event, sessionId: string) => {
  launchOverlay(sessionId);
  return { success: true };
});

/**
 * Renderer → Main: close the overlay.
 */
ipcMain.handle("overlay:close", () => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
    overlayWindow = null;
  }
  return { success: true };
});

/**
 * Renderer → Main: set overlay opacity (0.0 – 1.0).
 */
ipcMain.handle("overlay:setOpacity", (_event, value: number) => {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    const clamped = Math.max(0.1, Math.min(1.0, value));
    overlayWindow.setOpacity(clamped);
  }
  return { success: true };
});

/**
 * Renderer → Main: snap overlay to a screen corner.
 */
ipcMain.handle(
  "overlay:snapToCorner",
  (_event, corner: "top-right" | "top-left" | "bottom-right" | "bottom-left") => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return;

    const { width: screenW, height: screenH } =
      screen.getPrimaryDisplay().workAreaSize;
    const [winW, winH] = overlayWindow.getSize();
    const MARGIN = 16;

    const positions = {
      "top-right": { x: screenW - winW - MARGIN, y: MARGIN },
      "top-left": { x: MARGIN, y: MARGIN },
      "bottom-right": { x: screenW - winW - MARGIN, y: screenH - winH - MARGIN },
      "bottom-left": { x: MARGIN, y: screenH - winH - MARGIN },
    };

    overlayWindow.setPosition(positions[corner].x, positions[corner].y);
    return { success: true };
  }
);
